import { http, HttpResponse } from 'msw'

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  auth_provider: 'email',
  location: null,
  preferences: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: null,
}
const mockItinerary = {
  id: 1,
  title: 'Day in Istanbul',
  location: 'Istanbul',
  lat: 41.0082,
  lng: 28.9784,
  status: 'upcoming',
  purpose: 'tourism',
  generated_by_ai: false,
  date: '2026-07-01',
  activities: [],
  user_id: 1,
  description: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: null,
}
const mockCommunity = {
  id: 1,
  name: 'Istanbul Explorers',
  location: 'Istanbul',
  category: 'travel',
  member_count: 42,
  description: 'Explore Istanbul',
  created_by: 1,
  cover_image_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: null,
}

export const handlers = [
  http.get('*/api/v1/auth/me', () => HttpResponse.json(mockUser)),
  http.post('*/api/v1/auth/google', () =>
    HttpResponse.json({ access_token: 'mock-jwt', token_type: 'bearer', user: mockUser })
  ),
  http.post('*/api/v1/auth/register', () =>
    HttpResponse.json(
      { access_token: 'mock-jwt', token_type: 'bearer', user: mockUser },
      { status: 201 }
    )
  ),
  http.post('*/api/v1/auth/login', () =>
    HttpResponse.json({ access_token: 'mock-jwt', token_type: 'bearer', user: mockUser })
  ),
  http.get('*/api/v1/itineraries', () => HttpResponse.json([mockItinerary])),
  http.post('*/api/v1/itineraries', () =>
    HttpResponse.json(mockItinerary, { status: 201 })
  ),
  http.post('*/api/v1/itineraries/generate', () =>
    HttpResponse.json(mockItinerary, { status: 201 })
  ),
  http.get('*/api/v1/communities', () => HttpResponse.json([mockCommunity])),
  http.post('*/api/v1/communities', () =>
    HttpResponse.json({ ...mockCommunity, id: 2 }, { status: 201 })
  ),
]