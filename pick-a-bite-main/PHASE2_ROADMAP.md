# 🎯 PICK A BITE - FAZ 2 IMPLEMENTATION ROADMAP

## 📋 Genel Bakış
**Faz 1**: QR kod okutma → Menü gösterme ✅ (Tamamlandı)
**Faz 2**: Chatbot + AI Önerileri → Çoklu Restoran Analizi 🔄 (Yapılıyor)

---

## 🏗️ FAZ 2 ARKİTEKTÜRÜ

```
FRONTEND (React Native)
    ↓
Chat Ekranı → "250 TL altında glütensiz tavuklu yemek öner"
    ↓
BACKEND (Spring Boot)
    ↓
1. NLP Service → Intent Çıkart (bütçe, alerjen, beslenme, yemek tipi)
2. Location Service → Yakındaki restoranlar (Haversine)
3. Menu Filter Service → Ürünleri filtreleme
4. Scoring Engine → Önerileri skorlama
    ↓
PostgreSQL Database
    ├─ kullanici (profil, tercihler, alerjenler)
    ├─ restoran (konum, qr_kod)
    ├─ kategori, urun, urun_alerjen
    └─ chat_sessions, chat_messages (YENİ)
    ↓
RESPONSE → [Top 3-5 ürün + Restoran + Fiyat + Kalori + Alerjen Uyarısı]
```

---

## 📦 PHASE 2 - SPRINT PLANI

### SPRINT 1: Database & Backend Foundation (1-2 hafta)

#### Task 1.1: Chat Tables Oluştur
**File**: `src/main/resources/db/migration/V001__create_chat_tables.sql`
```sql
CREATE TABLE chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL REFERENCES kullanici(id),
    restoran_id INTEGER REFERENCES restoran(id),
    baslik VARCHAR(255),
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    gonderici VARCHAR(50), -- 'user' veya 'assistant'
    mesaj TEXT NOT NULL,
    gonderim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id)
);
```

#### Task 1.2: Chat Entities
**Files**:
- `src/main/java/com/aliyilmaz/entities/ChatSession.java`
- `src/main/java/com/aliyilmaz/entities/ChatMessage.java`

**ChatSession Entity**:
```java
@Entity
@Table(name = "chat_sessions")
public class ChatSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kullanici_id")
    private Kullanici kullanici;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restoran_id")
    private Restoran restoran;
    
    private String baslik;
    private LocalDateTime olusturmaTarihi;
}
```

**ChatMessage Entity**:
```java
@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id")
    private ChatSession session;
    
    private String gonderici; // "user" | "assistant"
    private String mesaj;
    private LocalDateTime gonderimTarihi;
}
```

#### Task 1.3: Chat Repositories
**Files**:
- `src/main/java/com/aliyilmaz/repository/ChatSessionRepository.java`
- `src/main/java/com/aliyilmaz/repository/ChatMessageRepository.java`

```java
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByKullaniciIdOrderByOlusturmaTarihiDesc(Integer kullaniciId);
    Optional<ChatSession> findById(Long sessionId);
}

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByGonderimTarihiAsc(Long sessionId);
}
```

---

### SPRINT 2: NLP & Intent Extraction (1-2 hafta)

#### Task 2.1: Intent DTO
**File**: `src/main/java/com/aliyilmaz/dto/DtoIntent.java`
```java
public class DtoIntent {
    private BigDecimal minBudget;     // "250 TL" → 250
    private BigDecimal maxBudget;
    private Set<String> alerjenler;  // "glütensiz" → {"gluten"}
    private String beslenmeMethod;   // "vegan", "vejetaryen", null
    private String yemekTipi;        // "tavuklu", "hafif", "sağlıklı"
    private String niyet;            // "primary_intent"
}
```

#### Task 2.2: NLP Service Interface
**File**: `src/main/java/com/aliyilmaz/services/INLPService.java`
```java
public interface INLPService {
    /**
     * "250 TL altında glütensiz tavuklu yemek" → Intent
     */
    DtoIntent extractIntent(String userMessage);
}
```

#### Task 2.3: NLP Service Implementation
**File**: `src/main/java/com/aliyilmaz/services/impl/NLPService.java`

**Implementasyon Stratejisi**:
1. **String Pattern Matching** (Basit):
   - "(\d+)\s*(?:TL|lira)" → Bütçe
   - "glütensiz|gluten free" → glutensiz
   - "vegan" → vegan
   - "tavuk|chicken" → yemek tipi

2. **OpenAI/Claude API** (Gelişmiş - İsteğe bağlı):
   ```java
   String prompt = "Aşağıdaki sorgudan intent çıkar:\n'" + userMessage + "'";
   // OpenAI API çağrısı → JSON cevap
   // JSON'dan DtoIntent oluştur
   ```

**Örnek Kodlama**:
```java
@Service
public class NLPService implements INLPService {
    private static final Pattern BUDGET_PATTERN = Pattern.compile("(\\d+)\\s*(?:tl|lira)", Pattern.CASE_INSENSITIVE);
    
    @Override
    public DtoIntent extractIntent(String message) {
        DtoIntent intent = new DtoIntent();
        
        // Bütçe çıkart
        Matcher budgetMatcher = BUDGET_PATTERN.matcher(message);
        if (budgetMatcher.find()) {
            intent.setMaxBudget(new BigDecimal(budgetMatcher.group(1)));
        }
        
        // Alerjen/Tercih çıkart
        if (message.toLowerCase().contains("glutensiz") || message.toLowerCase().contains("gluten")) {
            intent.getAlerjenler().add("gluten");
        }
        if (message.toLowerCase().contains("vegan")) {
            intent.setBeslenmeMethod("vegan");
        }
        
        // Yemek tipi
        if (message.toLowerCase().contains("tavuk")) {
            intent.setYemekTipi("tavuk");
        }
        
        return intent;
    }
}
```

---

### SPRINT 3: Recommendation Engine (1-2 hafta)

#### Task 3.1: Preference Filter Service
**File**: `src/main/java/com/aliyilmaz/services/IPreferenceFilterService.java`

```java
public interface IPreferenceFilterService {
    /**
     * Tüm ürünleri kullanıcı tercihlerine göre filtrele
     */
    List<DtoUrun> filterByUserPreferences(List<DtoUrun> urunler, DtoIntent intent, Kullanici user);
    
    /**
     * Ürünü skorla (0-100)
     */
    int scoreProduct(DtoUrun urun, DtoIntent intent, Kullanici user);
}
```

#### Task 3.2: Filter Logic Implementation
**File**: `src/main/java/com/aliyilmaz/services/impl/PreferenceFilterService.java`

```java
@Service
public class PreferenceFilterService implements IPreferenceFilterService {
    
    @Override
    public List<DtoUrun> filterByUserPreferences(List<DtoUrun> urunler, DtoIntent intent, Kullanici user) {
        return urunler.stream()
            .filter(u -> !hasConflictingAllergens(u, user))
            .filter(u -> !hasConflictingAllergens(u, intent))
            .filter(u -> u.getFiyat().compareTo(intent.getMaxBudget()) <= 0)
            .collect(Collectors.toList());
    }
    
    @Override
    public int scoreProduct(DtoUrun urun, DtoIntent intent, Kullanici user) {
        int score = 50; // Baseline
        
        // Alerjen uyumu: -30 eğer çakışırsa
        if (hasConflictingAllergens(urun, user)) {
            return 0; // Tamamen elenir
        }
        
        // Bütçe uyumu: +20
        if (urun.getFiyat().compareTo(intent.getMaxBudget()) <= 0) {
            score += 20;
        }
        
        // Yemek tipi uyumu: +15
        if (intent.getYemekTipi() != null &&
            urun.getUrunAdi().toLowerCase().contains(intent.getYemekTipi().toLowerCase())) {
            score += 15;
        }
        
        // Kalori uyumu: +10
        if ("hafif".equalsIgnoreCase(intent.getYemekTipi()) &&
            urun.getTahminiKalori() != null && urun.getTahminiKalori() < 500) {
            score += 10;
        }
        
        return Math.min(score, 100);
    }
    
    private boolean hasConflictingAllergens(DtoUrun urun, Kullanici user) {
        if (user.getAlerjenler().isEmpty()) return false;
        return urun.getAlerjenler().stream()
            .anyMatch(a -> user.getAlerjenler().contains(a));
    }
    
    private boolean hasConflictingAllergens(DtoUrun urun, DtoIntent intent) {
        if (intent.getAlerjenler().isEmpty()) return false;
        return urun.getAlerjenler().stream()
            .anyMatch(a -> intent.getAlerjenler().contains(a));
    }
}
```

#### Task 3.3: Recommendation Service
**File**: `src/main/java/com/aliyilmaz/services/IRecommendationService.java`

```java
public interface IRecommendationService {
    /**
     * Kullanıcının isteğine uygun ürünleri öner
     */
    List<DtoRecommendation> recommendProducts(
        DtoIntent intent, 
        Kullanici user, 
        List<Restoran> nearbyRestaurants
    );
}
```

#### Task 3.4: Recommendation Implementation
**File**: `src/main/java/com/aliyilmaz/services/impl/RecommendationService.java`

```java
@Service
public class RecommendationService implements IRecommendationService {
    
    @Autowired
    private PreferenceFilterService filterService;
    
    @Autowired
    private MenuServices menuServices;
    
    @Override
    public List<DtoRecommendation> recommendProducts(
            DtoIntent intent,
            Kullanici user,
            List<Restoran> nearbyRestaurants) {
        
        List<DtoRecommendation> recommendations = new ArrayList<>();
        
        // Her yakındaki restoran için menüsü al ve filtrele
        for (Restoran restoran : nearbyRestaurants) {
            DtoMenu menu = menuServices.menuGetir(restoran.getId());
            
            List<DtoUrun> allProducts = menu.getKategoriler().stream()
                .flatMap(k -> k.getUrunler().stream())
                .collect(Collectors.toList());
            
            // Tercihler vs filtrele
            List<DtoUrun> filtered = filterService.filterByUserPreferences(
                allProducts, intent, user
            );
            
            // Skorla ve sırala
            filtered.sort((a, b) -> Integer.compare(
                filterService.scoreProduct(b, intent, user),
                filterService.scoreProduct(a, intent, user)
            ));
            
            // Top 3'ü rec'ye ekle
            filtered.stream().limit(3).forEach(urun -> {
                DtoRecommendation rec = new DtoRecommendation();
                rec.setRestoran(restoran);
                rec.setUrun(urun);
                rec.setMesafe(calculateDistance(user, restoran));
                rec.setScore(filterService.scoreProduct(urun, intent, user));
                recommendations.add(rec);
            });
        }
        
        // Hepsini skora göre sırala ve top 5 dön
        return recommendations.stream()
            .sorted((a, b) -> Integer.compare(b.getScore(), a.getScore()))
            .limit(5)
            .collect(Collectors.toList());
    }
    
    private double calculateDistance(Kullanici user, Restoran restoran) {
        // TODO: Kullanıcı konumundan restoran konumuna Haversine
        return 0.0;
    }
}
```

---

### SPRINT 4: Chat API & Integration (1 hafta)

#### Task 4.1: Chat DTOs
**Files**:
- `src/main/java/com/aliyilmaz/dto/DtoChatRequest.java`
- `src/main/java/com/aliyilmaz/dto/DtoChatResponse.java`
- `src/main/java/com/aliyilmaz/dto/DtoRecommendation.java`

```java
// DtoChatRequest
public class DtoChatRequest {
    private Long sessionId;
    private String message;
    private Double userEnlem;  // İsteğe bağlı
    private Double userBoylam;
    private Double searchRadius = 5.0; // km
}

// DtoChatResponse
public class DtoChatResponse {
    private String assistantMessage;
    private List<DtoRecommendation> recommendations;
    private Long sessionId;
}

// DtoRecommendation
public class DtoRecommendation {
    private Integer restoranId;
    private String restoranAdi;
    private String urunAdi;
    private BigDecimal fiyat;
    private Integer tahminiKalori;
    private Set<String> alerjenler;
    private Double mesafe;
    private Integer confidenceScore;
}
```

#### Task 4.2: Chat Service
**File**: `src/main/java/com/aliyilmaz/services/impl/ChatService.java`

```java
@Service
public class ChatService {
    
    @Autowired
    private ChatSessionRepository sessionRepo;
    
    @Autowired
    private ChatMessageRepository messageRepo;
    
    @Autowired
    private NLPService nlpService;
    
    @Autowired
    private RecommendationService recService;
    
    @Autowired
    private AppServices appServices;
    
    @Autowired
    private KullaniciServices userService;
    
    @Transactional
    public DtoChatResponse processMessage(DtoChatRequest request, Integer userId) {
        // Session al ya da oluştur
        ChatSession session = sessionRepo.findById(request.getSessionId())
            .orElseGet(() -> createNewSession(userId));
        
        // Kullanıcı mesajını kaydet
        saveMessage(session, "user", request.getMessage());
        
        // NLP ile intent çıkart
        DtoIntent intent = nlpService.extractIntent(request.getMessage());
        
        // Yakındaki restoranları al
        List<Restoran> nearby = appServices.yakindakiRestoranlar(
            request.getUserEnlem(), 
            request.getUserBoylam(),
            request.getSearchRadius()
        );
        
        // Kullanıcı tercihlerini al
        Kullanici user = userService.getUserById(userId);
        
        // Öneriler al
        List<DtoRecommendation> recommendations = recService.recommendProducts(
            intent, user, nearby
        );
        
        // Yanıt oluştur
        String responseMessage = generateAssistantResponse(recommendations, intent);
        saveMessage(session, "assistant", responseMessage);
        
        DtoChatResponse response = new DtoChatResponse();
        response.setAssistantMessage(responseMessage);
        response.setRecommendations(recommendations);
        response.setSessionId(session.getId());
        
        return response;
    }
    
    private ChatSession createNewSession(Integer userId) {
        ChatSession session = new ChatSession();
        session.setKullanici(userService.getUserById(userId));
        session.setOlusturmaTarihi(LocalDateTime.now());
        return sessionRepo.save(session);
    }
    
    private void saveMessage(ChatSession session, String gonderici, String mesaj) {
        ChatMessage msg = new ChatMessage();
        msg.setSession(session);
        msg.setGonderici(gonderici);
        msg.setMesaj(mesaj);
        msg.setGonderimTarihi(LocalDateTime.now());
        messageRepo.save(msg);
    }
    
    private String generateAssistantResponse(List<DtoRecommendation> recs, DtoIntent intent) {
        if (recs.isEmpty()) {
            return "Maalesef, belirttiğiniz kriterler ile eşleşen ürün bulamadım. " +
                   "Lütfen bütçenizi artırın veya alerjen sınırlarını hafifletin.";
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("Tercihlerinize uygun ").append(recs.size())
          .append(" seçenek buldum! İşte önerilerim:\n\n");
        
        for (int i = 0; i < recs.size(); i++) {
            DtoRecommendation rec = recs.get(i);
            sb.append(i + 1).append(". ").append(rec.getRestoranAdi())
              .append(" - ").append(rec.getUrunAdi())
              .append(" (₺").append(rec.getFiyat()).append(")\n");
            
            if (rec.getTahminiKalori() != null) {
                sb.append("   Kalori: ").append(rec.getTahminiKalori()).append("\n");
            }
            if (!rec.getAlerjenler().isEmpty()) {
                sb.append("   ⚠️ Alerjenler: ").append(String.join(", ", rec.getAlerjenler())).append("\n");
            }
        }
        
        return sb.toString();
    }
}
```

#### Task 4.3: Chat Controller
**File**: `src/main/java/com/aliyilmaz/controller/impl/ChatController.java`

```java
@RestController
@RequestMapping("/pick-a-bite/chat")
public class ChatController {
    
    @Autowired
    private ChatService chatService;
    
    @PostMapping("/message")
    public DtoChatResponse sendMessage(
            @Valid @RequestBody DtoChatRequest request,
            @CurrentUser Integer userId) {
        return chatService.processMessage(request, userId);
    }
    
    @GetMapping("/sessions/{sessionId}")
    public List<ChatMessage> getSessionMessages(
            @PathVariable Long sessionId,
            @CurrentUser Integer userId) {
        // Doğrulama: Bu session'ı kullanıcı oluşturdu mu?
        return chatService.getSessionMessages(sessionId, userId);
    }
}
```

---

### SPRINT 5: Testing & Optimization (1 hafta)

#### Task 5.1: Unit Tests
**Directories**:
- `src/test/java/com/aliyilmaz/services/NLPServiceTest.java`
- `src/test/java/com/aliyilmaz/services/PreferenceFilterServiceTest.java`
- `src/test/java/com/aliyilmaz/services/RecommendationServiceTest.java`

#### Task 5.2: Integration Tests
**File**: `src/test/java/com/aliyilmaz/controller/ChatControllerIntegrationTest.java`

#### Task 5.3: Performance Optimization
- Chat mesajları için indeksler
- Recommendation queries optimize et
- Caching (Redis) ekle (opsiyonel)

---

## 📊 VERITABANI MIGRATION PLANI

**V001__create_chat_tables.sql**: Chat tables
**V002__add_chat_indexes.sql**: Performance indexes
**V003__add_default_allergens.sql**: Standart alerjen kataloğu

---

## 🔗 API ENDPOINTS ÖZETI

### Chat API
```
POST   /pick-a-bite/chat/message          → Mesaj gönder + Öneriler al
GET    /pick-a-bite/chat/sessions/{id}   → Session geçmişi
POST   /pick-a-bite/chat/sessions        → Yeni session oluştur
```

### Recommendation API
```
GET    /pick-a-bite/recommendations?intent=...&radius=5
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Database migrations çalıştırıldı
- [ ] Entity ve Repository testleri geçti
- [ ] Service unit testleri geçti
- [ ] Integration testleri geçti
- [ ] API endpoint'leri test edildi
- [ ] Production config setup
- [ ] Security review
- [ ] Performance testing
- [ ] Frontend integration

---

## 📞 DEĞERLENDİRME KRİTERLERİ

✅ Chat API mesaj gönderebilirse
✅ NLP intent 80%+ doğruluk sağlarsa
✅ Recommendations 3-5 ürün dönerse
✅ API response < 2 saniye
✅ Alerjen filtreleme 100% doğruysa
✅ Kullanıcı profil tercihleri uygulanıyorsa

---

## 📝 NOTLAR

- **AI Integration**: Başlangıçta string pattern matching kullan. Sonra OpenAI/Claude API ekle
- **Database**: Migration dosyaları Flyway/Liquibase ile yönet
- **Testing**: Her service için unit + integration test yaz
- **Security**: Input validation ve SQL injection preventions

