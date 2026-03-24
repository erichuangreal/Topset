package com.topset.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record SaveWorkoutRequest(
        @NotNull
        @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "date must be YYYY-MM-DD")
        String date,

        @NotEmpty @Valid
        List<ExerciseRequest> exercises
) {}
