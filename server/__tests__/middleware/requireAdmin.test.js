const requireAdmin = require('../../src/middleware/requireAdmin');

describe('requireAdmin middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { user: { role: 'admin' } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('calls next() when user is admin', () => {
    requireAdmin(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('returns 403 when user is not admin', () => {
    mockReq.user.role = 'volunteer';
    requireAdmin(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 403 when user is organiser', () => {
    mockReq.user.role = 'organiser';
    requireAdmin(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 403 when user is null', () => {
    mockReq.user = null;
    requireAdmin(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when user is undefined', () => {
    mockReq.user = undefined;
    requireAdmin(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });

  it('returns Access denied message', () => {
    mockReq.user.role = 'volunteer';
    requireAdmin(mockReq, mockRes, mockNext);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Access denied' })
    );
  });
});
