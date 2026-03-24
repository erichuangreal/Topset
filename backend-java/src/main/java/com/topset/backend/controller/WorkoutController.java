package com.topset.backend.controller;

import com.topset.backend.dto.request.SaveRestDayRequest;
import com.topset.backend.dto.request.SaveWorkoutRequest;
import com.topset.backend.dto.response.ApiResponse;
import com.topset.backend.dto.response.WorkoutIdResponse;
import com.topset.backend.dto.response.WorkoutListResponse;
import com.topset.backend.service.WorkoutService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workouts")
@Validated
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    // POST /api/workouts
    @PostMapping
    public ResponseEntity<ApiResponse<WorkoutIdResponse>> saveWorkout(
            @Valid @RequestBody SaveWorkoutRequest request) {
        Long id = workoutService.saveWorkout(request);
        return ResponseEntity.ok(ApiResponse.success(new WorkoutIdResponse(id)));
    }

    // POST /api/workouts/rest
    @PostMapping("/rest")
    public ResponseEntity<ApiResponse<WorkoutIdResponse>> saveRestDay(
            @Valid @RequestBody SaveRestDayRequest request) {
        Long id = workoutService.saveRestDay(request);
        return ResponseEntity.ok(ApiResponse.success(new WorkoutIdResponse(id)));
    }

    // GET /api/workouts?date=YYYY-MM-DD
    @GetMapping
    public ResponseEntity<ApiResponse<WorkoutListResponse>> getByDate(
            @RequestParam
            @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "date must be YYYY-MM-DD")
            String date) {
        var workouts = workoutService.getByDate(date);
        return ResponseEntity.ok(ApiResponse.success(new WorkoutListResponse(workouts)));
    }

    // GET /api/workouts/range?start=YYYY-MM-DD&end=YYYY-MM-DD
    @GetMapping("/range")
    public ResponseEntity<ApiResponse<WorkoutListResponse>> getByRange(
            @RequestParam
            @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "start must be YYYY-MM-DD")
            String start,
            @RequestParam
            @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "end must be YYYY-MM-DD")
            String end) {
        var workouts = workoutService.getByRange(start, end);
        return ResponseEntity.ok(ApiResponse.success(new WorkoutListResponse(workouts)));
    }

    // DELETE /api/workouts/all
    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<Void>> deleteAll() {
        workoutService.deleteAll();
        return ResponseEntity.ok(ApiResponse.empty());
    }
}
