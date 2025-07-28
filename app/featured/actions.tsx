
export interface FeaturedLocationData {
  Title: string;
  SubTitle: string;
  Image: string;
  AddressId?: string;
}

export interface FeaturedLocation {
  Id: string;
  CreatedAt: string;
  Title: string;
  SubTitle: string;
  Image: string;
  AddressId?: string;
}

export async function fetchFeaturedLocations(): Promise<FeaturedLocation[]> {
  const response = await fetch('/api/featured-locations', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch featured locations');
  }

  return response.json();
}

export async function createFeaturedLocation(data: FeaturedLocationData): Promise<FeaturedLocation | null> {
  const response = await fetch('/api/featured-locations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create featured location');
  }

  return response.json();
}

export async function updateFeaturedLocation(id: string, data: FeaturedLocationData): Promise<FeaturedLocation | null> {
  const response = await fetch(`/api/featured-locations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update featured location');
  }

  return response.json();
}

export async function deleteFeaturedLocation(id: string): Promise<boolean> {
  const response = await fetch(`/api/featured-locations/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete featured location');
  }

  return true;
}