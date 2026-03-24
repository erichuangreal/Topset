package com.topset.backend.dto.response;

import java.util.List;

public record ExerciseResponse(
        Long id,
        String name,
        List<SetResponse> sets
) {}
