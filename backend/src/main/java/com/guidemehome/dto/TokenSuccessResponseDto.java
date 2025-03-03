package com.guidemehome.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Getter
@Builder
@Jacksonized
public class TokenSuccessResponseDto {

	private String accessToken;
	private String role;

}