package com.topset.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "WorkoutExercise")
public class WorkoutExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workoutId", nullable = false)
    private Workout workout;

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    @Column(name = "`order`", nullable = false)
    private int order;

    @BatchSize(size = 50)
    @OneToMany(mappedBy = "workoutExercise", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("order ASC")
    private List<ExerciseSet> sets = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Workout getWorkout() { return workout; }
    public void setWorkout(Workout workout) { this.workout = workout; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getOrder() { return order; }
    public void setOrder(int order) { this.order = order; }

    public List<ExerciseSet> getSets() { return sets; }
    public void setSets(List<ExerciseSet> sets) { this.sets = sets; }
}
