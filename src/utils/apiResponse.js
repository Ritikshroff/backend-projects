class ApiResponse {
    constructor(statuscode, data = null, message = "", success = true) {
        this.statuscode = statuscode;
        this.data = data;
        this.message = message;
        this.success = success;
    }
}

export default ApiResponse;