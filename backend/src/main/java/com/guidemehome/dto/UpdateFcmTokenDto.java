package com.guidemehome.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateFcmTokenDto {
    private String userId;
    private String fcmToken;
}
