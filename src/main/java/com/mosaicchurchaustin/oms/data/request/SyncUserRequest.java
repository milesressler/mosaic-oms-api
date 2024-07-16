package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;


public record SyncUserRequest(@NotBlank String name,
                              @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username must contain only letters, numbers, or underscores")
                              @NotBlank String username){}
