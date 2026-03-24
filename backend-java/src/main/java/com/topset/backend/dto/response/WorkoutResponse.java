package com.topset.backend.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record WorkoutResponse(
        Long id,
        String date,
        LocalDateTime createdAt,
        boolean restDay,
        List<ExerciseResponse> exercises
) {}
