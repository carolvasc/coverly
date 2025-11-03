import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3001';

export interface TogglBookHoursResponse {
  hours: number;
}

class TogglApi {
  async getBookHours(title: string): Promise<number> {
    try {
      const response = await axios.get<TogglBookHoursResponse>(`${API_BASE_URL}/toggl/books`, {
        params: { title },
        timeout: 10000,
      });

      const data = response.data;

      if (typeof data?.hours !== 'number') {
        throw new Error('Resposta inválida do Toggl Track');
      }

      return data.hours;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Nenhum registro encontrado no Toggl Track para esse livro.');
        }

        if (error.response?.status === 401) {
          throw new Error('Não foi possível autenticar no Toggl Track.');
        }

        if (error.code === 'ECONNABORTED') {
          throw new Error('A consulta ao Toggl Track demorou demais.');
        }

        if (error.code === 'ERR_NETWORK') {
          throw new Error('Falha ao conectar com o servidor do Toggl Track.');
        }
      }

      throw new Error('Não foi possível consultar o Toggl Track.');
    }
  }
}

export const togglApi = new TogglApi();
