package com.topset.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean ok,
        T data,
        String error
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> empty() {
        return new ApiResponse<>(true, null, null);
    }

    public static <T> ApiResponse<T> failure(String error) {
        return new ApiResponse<>(false, null, error);
    }
}
