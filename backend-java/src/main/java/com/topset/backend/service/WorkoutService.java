package com.topset.backend.service;

import com.topset.backend.dto.request.ExerciseRequest;
import com.topset.backend.dto.request.SaveRestDayRequest;
import com.topset.backend.dto.request.SaveWorkoutRequest;
import com.topset.backend.dto.response.ExerciseResponse;
import com.topset.backend.dto.response.SetResponse;
import com.topset.backend.dto.response.WorkoutResponse;
import com.topset.backend.entity.ExerciseSet;
import com.topset.backend.entity.Workout;
import com.topset.backend.entity.WorkoutExercise;
import com.topset.backend.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

    public WorkoutService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    public Long saveWorkout(SaveWorkoutRequest req) {
        LocalDate date = LocalDate.parse(req.date());

        Workout workout = new Workout();
        workout.setDate(date);
        workout.setRestDay(false);

        List<ExerciseRequest> exerciseRequests = req.exercises();
        for (int i = 0; i < exerciseRequests.size(); i++) {
            ExerciseRequest exReq = exerciseRequests.get(i);

            WorkoutExercise exercise = new WorkoutExercise();
            exercise.setName(exReq.name());
            exercise.setOrder(i);
            exercise.setWorkout(workout);

            for (int j = 0; j < exReq.sets().size(); j++) {
                var setReq = exReq.sets().get(j);
                ExerciseSet set = new ExerciseSet();
                set.setOrder(j);
                set.setWeight(setReq.weight());
                set.setReps(setReq.reps());
                set.setWorkoutExercise(exercise);
                exercise.getSets().add(set);
            }

            workout.getExercises().add(exercise);
        }

        return workoutRepository.save(workout).getId();
    }

    public Long saveRestDay(SaveRestDayRequest req) {
        LocalDate date = LocalDate.parse(req.date());

        Workout workout = new Workout();
        workout.setDate(date);
        workout.setRestDay(true);

        return workoutRepository.save(workout).getId();
    }

    @Transactional(readOnly = true)
    public List<WorkoutResponse> getByDate(String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return workoutRepository.findByDateWithDetails(date)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WorkoutResponse> getByRange(String startStr, String endStr) {
        LocalDate start = LocalDate.parse(startStr);
        LocalDate end = LocalDate.parse(endStr);
        return workoutRepository.findByDateRangeWithDetails(start, end)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void deleteAll() {
        workoutRepository.deleteAll();
    }

    private WorkoutResponse toResponse(Workout w) {
        List<ExerciseResponse> exercises = w.getExercises().stream()
                .map(ex -> new ExerciseResponse(
                        ex.getId(),
                        ex.getName(),
                        ex.getSets().stream()
                                .map(s -> new SetResponse(s.getId(), s.getWeight(), s.getReps()))
                                .toList()
                ))
                .toList();

        return new WorkoutResponse(
                w.getId(),
                w.getDate().toString(),
                w.getCreatedAt(),
                w.isRestDay(),
                exercises
        );
    }
}
