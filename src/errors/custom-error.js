import { StatusCodes } from "http-status-codes";

export class CustomError extends Error {
  constructor(statusCode, message, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || this.constructor.name;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class ValidationError extends CustomError {
  constructor(message = "유효성 검증에 실패했습니다.") {
    super(StatusCodes.BAD_REQUEST, message, "VALIDATION_ERROR");
  }
}

// 400 Bad Request
export class InvalidEmailFormatError extends CustomError {
  constructor(message = "올바른 이메일 형식이 아닙니다.") {
    super(StatusCodes.BAD_REQUEST, message, "INVALID_EMAIL_FORMAT");
  }
}

// 400 Bad Request
export class PasswordTooShortError extends CustomError {
  constructor(message = "비밀번호는 8자 이상이어야 합니다.") {
    super(StatusCodes.BAD_REQUEST, message, "PASSWORD_TOO_SHORT");
  }
}

// 400 Bad Request
export class InvalidVerificationCodeError extends CustomError {
  constructor(message = "유효하지 않은 인증 코드입니다.") {
    super(StatusCodes.BAD_REQUEST, message, "INVALID_VERIFICATION_CODE");
  }
}

// 400 Bad Request
export class MissionNotCompletedError extends CustomError {
  constructor(message = "완료된 미션을 찾을 수 없습니다.") {
    super(StatusCodes.BAD_REQUEST, message, "MISSION_NOT_COMPLETED");
  }
}

// 400 Bad Request
export class StoreNotFoundError extends CustomError {
  constructor(message = "존재하지 않는 가게입니다.") {
    super(StatusCodes.BAD_REQUEST, message, "STORE_NOT_FOUND");
  }
}

// 400 Bad Request
export class MissionNotFoundError extends CustomError {
  constructor(message = "존재하지 않는 미션입니다.") {
    super(StatusCodes.BAD_REQUEST, message, "MISSION_NOT_FOUND");
  }
}

// 403 Forbidden
export class ForbiddenError extends CustomError {
  constructor(message = "접근 권한이 없습니다.") {
    super(StatusCodes.FORBIDDEN, message, "FORBIDDEN");
  }
}

// 409 Conflict
export class EmailAlreadyExistsError extends CustomError {
  constructor(message = "이미 존재하는 이메일입니다.") {
    super(StatusCodes.CONFLICT, message, "EMAIL_ALREADY_EXISTS");
  }
}

// 409 Conflict
export class MissionAlreadyChallengedError extends CustomError {
  constructor(message = "이미 도전 중인 미션입니다.") {
    super(StatusCodes.CONFLICT, message, "MISSION_ALREADY_CHALLENGED");
  }
}

// 409 Conflict
export class InvalidMissionStatusError extends CustomError {
  constructor(message = "진행 중인 미션만 완료할 수 있습니다.") {
    super(StatusCodes.CONFLICT, message, "INVALID_MISSION_STATUS");
  }
}

// 409 Conflict
export class ReviewAlreadyExistsError extends CustomError {
  constructor(message = "이미 리뷰를 작성한 미션입니다.") {
    super(StatusCodes.CONFLICT, message, "REVIEW_ALREADY_EXISTS");
  }
}

// 500 Internal Server Error
export class InternalServerError extends CustomError {
  constructor(message = "서버 내부 오류가 발생했습니다.") {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, "INTERNAL_SERVER_ERROR");
  }
}

