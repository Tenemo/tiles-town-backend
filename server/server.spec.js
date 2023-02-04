import request from 'supertest';
import app from './server';

describe('API', () => {
    describe('health-check route', () => {
        it('should respond with OK', () => {
            return request(app)
                .get('/api/health-check')
                .expect('Content-Type', 'text/html; charset=utf-8')
                .expect(200 || 304)
                .then(response => {
                    expect(response.text).toMatch('OK');
                });
        });
    });
});