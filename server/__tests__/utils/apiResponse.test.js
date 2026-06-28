const { successResponse, errorResponse } = require('../../src/utils/apiResponse.utils');

describe('apiResponse.utils', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('successResponse', () => {
    it('returns 200 with success: true by default', () => {
      successResponse(mockRes, { id: 1 }, 'OK');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: { id: 1 }, message: 'OK' })
      );
    });

    it('accepts custom status code', () => {
      successResponse(mockRes, null, 'Created', 201);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('returns success: true in all cases', () => {
      successResponse(mockRes, [], 'List');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('passes data through unchanged', () => {
      const data = { users: [{ name: 'John' }], total: 1 };
      successResponse(mockRes, data, 'Found');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ data })
      );
    });
  });

  describe('errorResponse', () => {
    it('returns 400 with success: false by default', () => {
      errorResponse(mockRes, 'Bad request');
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Bad request' })
      );
    });

    it('accepts custom status code', () => {
      errorResponse(mockRes, 'Not found', 404);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('includes errors array when provided', () => {
      errorResponse(mockRes, 'Validation failed', 422, ['Field required']);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ errors: ['Field required'] })
      );
    });

    it('defaults to empty errors array', () => {
      errorResponse(mockRes, 'Error');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ errors: [] })
      );
    });
  });
});
