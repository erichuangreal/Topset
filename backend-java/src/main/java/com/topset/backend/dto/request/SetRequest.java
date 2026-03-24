package com.topset.backend.dto.request;

import java.math.BigDecimal;

public record SetRequest(
        BigDecimal weight,
        Integer reps
) {}
