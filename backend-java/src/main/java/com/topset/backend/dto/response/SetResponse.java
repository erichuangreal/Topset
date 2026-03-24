package com.topset.backend.dto.response;

import java.math.BigDecimal;

public record SetResponse(
        Long id,
        BigDecimal weight,
        Integer reps
) {}
