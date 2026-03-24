package com.topset.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ExerciseSet", indexes = {
    @Index(name = "ExerciseSet_workoutExerciseId_idx", columnList = "workoutExerciseId")
})
public class ExerciseSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workoutExerciseId", nullable = false)
    private WorkoutExercise workoutExercise;

    @Column(name = "`order`", nullable = false)
    private int order;

    @Column(name = "weight", precision = 8, scale = 2)
    private BigDecimal weight;

    @Column(name = "reps")
    private Integer reps;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WorkoutExercise getWorkoutExercise() { return workoutExercise; }
    public void setWorkoutExercise(WorkoutExercise workoutExercise) { this.workoutExercise = workoutExercise; }

    public int getOrder() { return order; }
    public void setOrder(int order) { this.order = order; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }
}
