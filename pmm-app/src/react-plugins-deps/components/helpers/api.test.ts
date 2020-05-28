import { apiRequestQAN } from './api';
import axios from 'axios';
jest.mock('axios');
jest.mock('./notification-manager', () => () => ({}));

xdescribe('GET tests', () => {
  xit('should return data', async () => {
    axios.get.mockResolvedValue({ data: 'some data' });
    const result = await apiRequestQAN.get('/test/path', { params: { key: 'value' } });
    await expect(result).toEqual('some data');
  });
});

describe('POST tests', () => {
  xit('should return data', async () => {
    axios.post.mockResolvedValue({ data: 'some data' });
    const result = await apiRequestQAN.post('/test/path', { key: 'value' });
    await expect(result).toEqual('some data');
  });
});

describe('PATCH tests', () => {
  xit('should return data', async () => {
    axios.patch.mockResolvedValue({ data: 'some data' });
    const result = await apiRequestQAN.patch('/test/path', { key: 'value' });
    await expect(result).toEqual('some data');
  });
});

describe('DELETE tests', () => {
  xit('should return data', async () => {
    axios.delete.mockResolvedValue({ data: 'some data' });
    const result = await apiRequestQAN.delete('/test/path');
    await expect(result).toEqual('some data');
  });
});
