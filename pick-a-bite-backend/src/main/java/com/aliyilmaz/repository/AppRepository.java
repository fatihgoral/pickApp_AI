package com.aliyilmaz.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.aliyilmaz.entities.Restoran;

public interface AppRepository extends JpaRepository<Restoran, Integer> {

	Optional<Restoran> findByQrKod(String qrKod);

	/**
	 * Verilen merkez koordinatlardan belirtilen yarıçap (km) içindeki restoranları
	 * Haversine formülü ile en yakındakinden başlayarak listeler.
	 */
	@Query(value = """
			SELECT * FROM restoran r
			WHERE (
				6371 * acos(
					cos(radians(:enlem)) * cos(radians(r.enlem))
					* cos(radians(r.boylam) - radians(:boylam))
					+ sin(radians(:enlem)) * sin(radians(r.enlem))
				)
			) <= :yaricapKm
			ORDER BY (
				6371 * acos(
					cos(radians(:enlem)) * cos(radians(r.enlem))
					* cos(radians(r.boylam) - radians(:boylam))
					+ sin(radians(:enlem)) * sin(radians(r.enlem))
				)
			) ASC
			""", nativeQuery = true)
	List<Restoran> yakindakiRestoranlar(@Param("enlem") double enlem,
			@Param("boylam") double boylam,
			@Param("yaricapKm") double yaricapKm);
}
