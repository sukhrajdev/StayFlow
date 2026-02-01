// src/utils/ApiResponse.ts

export class ApiResponse {
  /**
   * Standard Success Response
   */
  static success(res: any, data: any, message: string = "Success", statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Standard Error Response
   */
  static error(res: any, message: string = "Internal Server Error", statusCode: number = 500, errors: any = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}