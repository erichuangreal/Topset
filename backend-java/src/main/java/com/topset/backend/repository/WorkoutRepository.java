package com.topset.backend.repository;

import com.topset.backend.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    @Query("""
            SELECT DISTINCT w FROM Workout w
            LEFT JOIN FETCH w.exercises
            WHERE w.date = :date
            ORDER BY w.createdAt ASC
            """)
    List<Workout> findByDateWithDetails(@Param("date") LocalDate date);

    @Query("""
            SELECT DISTINCT w FROM Workout w
            LEFT JOIN FETCH w.exercises
            WHERE w.date BETWEEN :start AND :end
            ORDER BY w.date ASC, w.createdAt ASC
            """)
    List<Workout> findByDateRangeWithDetails(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}
