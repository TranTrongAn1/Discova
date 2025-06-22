import api from '../(auth)/api';

// Function to fetch psychologists from the marketplace API
export const fetchPsychologists = async () => {
  try {
    const response = await api.get('/api/psychologists/marketplace/');
    
    if (response.data && response.data.results) {
      return response.data.results.map(psychologist => ({
        id: psychologist.user,
        name: psychologist.full_name,
        img: psychologist.profile_picture_url || null,
        des: psychologist.biography || 'No biography available',
        rating: 0, // Rating not available in marketplace API
        numberOfReviews: 0, // Reviews not available in marketplace API
        yearsOfExperience: psychologist.years_of_experience,
        offersOnline: psychologist.offers_online_sessions,
        offersConsultation: psychologist.offers_initial_consultation,
        hourlyRate: psychologist.hourly_rate,
        consultationRate: psychologist.initial_consultation_rate,
        officeAddress: psychologist.office_address,
        websiteUrl: psychologist.website_url,
        linkedinUrl: psychologist.linkedin_url,
        licenseAuthority: psychologist.license_issuing_authority,
        education: psychologist.education,
        certifications: psychologist.certifications,
        servicesOffered: psychologist.services_offered,
        profileCompleteness: psychologist.profile_completeness,
        createdAt: psychologist.created_at
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching psychologists:', error);
    throw new Error('Failed to fetch psychologists');
  }
};

// Function to fetch a single psychologist by ID
export const fetchPsychologistById = async (psychologistId) => {
  try {
    const response = await api.get(`/api/psychologists/marketplace/${psychologistId}/`);
    
    if (response.data) {
      const psychologist = response.data;
      return {
        id: psychologist.user,
        name: psychologist.full_name,
        img: psychologist.profile_picture_url || null,
        des: psychologist.biography || 'No biography available',
        rating: 0, // Rating not available in marketplace API
        numberOfReviews: 0, // Reviews not available in marketplace API
        yearsOfExperience: psychologist.years_of_experience,
        offersOnline: psychologist.offers_online_sessions,
        offersConsultation: psychologist.offers_initial_consultation,
        hourlyRate: psychologist.hourly_rate,
        consultationRate: psychologist.initial_consultation_rate,
        officeAddress: psychologist.office_address,
        websiteUrl: psychologist.website_url,
        linkedinUrl: psychologist.linkedin_url,
        licenseAuthority: psychologist.license_issuing_authority,
        education: psychologist.education,
        certifications: psychologist.certifications,
        servicesOffered: psychologist.services_offered,
        profileCompleteness: psychologist.profile_completeness,
        createdAt: psychologist.created_at
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching psychologist:', error);
    throw new Error('Failed to fetch psychologist details');
  }
};

// Function to search psychologists
export const searchPsychologists = async (searchParams) => {
  try {
    const response = await api.post('/api/psychologists/marketplace/search/', searchParams);
    
    if (response.data && response.data.results) {
      return response.data.results.map(psychologist => ({
        id: psychologist.user,
        name: psychologist.full_name,
        img: psychologist.profile_picture_url || null,
        des: psychologist.biography || 'No biography available',
        rating: 0, // Rating not available in marketplace API
        numberOfReviews: 0, // Reviews not available in marketplace API
        yearsOfExperience: psychologist.years_of_experience,
        offersOnline: psychologist.offers_online_sessions,
        offersConsultation: psychologist.offers_initial_consultation,
        hourlyRate: psychologist.hourly_rate,
        consultationRate: psychologist.initial_consultation_rate,
        officeAddress: psychologist.office_address,
        websiteUrl: psychologist.website_url,
        linkedinUrl: psychologist.linkedin_url,
        licenseAuthority: psychologist.license_issuing_authority,
        education: psychologist.education,
        certifications: psychologist.certifications,
        servicesOffered: psychologist.services_offered,
        profileCompleteness: psychologist.profile_completeness,
        createdAt: psychologist.created_at
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching psychologists:', error);
    throw new Error('Failed to search psychologists');
  }
};

// Function to filter psychologists
export const filterPsychologists = async (filters) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.minExperience) queryParams.append('min_experience', filters.minExperience);
    if (filters.services) queryParams.append('services', filters.services);
    if (filters.page) queryParams.append('page', filters.page);
    
    const response = await api.get(`/api/psychologists/marketplace/filter/?${queryParams.toString()}`);
    
    if (response.data && response.data.results) {
      return response.data.results.map(psychologist => ({
        id: psychologist.user,
        name: psychologist.full_name,
        img: psychologist.profile_picture_url || null,
        des: psychologist.biography || 'No biography available',
        rating: 0, // Rating not available in marketplace API
        numberOfReviews: 0, // Reviews not available in marketplace API
        yearsOfExperience: psychologist.years_of_experience,
        offersOnline: psychologist.offers_online_sessions,
        offersConsultation: psychologist.offers_initial_consultation,
        hourlyRate: psychologist.hourly_rate,
        consultationRate: psychologist.initial_consultation_rate,
        officeAddress: psychologist.office_address,
        websiteUrl: psychologist.website_url,
        linkedinUrl: psychologist.linkedin_url,
        licenseAuthority: psychologist.license_issuing_authority,
        education: psychologist.education,
        certifications: psychologist.certifications,
        servicesOffered: psychologist.services_offered,
        profileCompleteness: psychologist.profile_completeness,
        createdAt: psychologist.created_at
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error filtering psychologists:', error);
    throw new Error('Failed to filter psychologists');
  }
};

// Fallback mock data in case API is not available (for development/testing)
const fallbackPsychologists = [
  {
    id: 'fallback-1',
    name: "Dr. Sarah Johnson",
    img: null,
    des: "Child and adolescent psychologist with 15 years of experience in anxiety, depression, and social skills development.",
    rating: 4.8,
    numberOfReviews: 120,
    yearsOfExperience: 15,
    offersOnline: true,
    offersConsultation: true,
    hourlyRate: "150.00",
    consultationRate: "250.00",
    officeAddress: "123 Main Street, Suite 100, City, State 12345",
    websiteUrl: null,
    linkedinUrl: null,
    licenseAuthority: "State Board of Psychology",
    education: {},
    certifications: {},
    servicesOffered: [],
    profileCompleteness: "Complete",
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 'fallback-2',
    name: "Dr. Michael Chen",
    img: null,
    des: "Marriage and family therapist helping couples and families improve communication, resolve conflicts, and build sustainable relationships.",
    rating: 4.6,
    numberOfReviews: 95,
    yearsOfExperience: 12,
    offersOnline: true,
    offersConsultation: true,
    hourlyRate: "140.00",
    consultationRate: "240.00",
    officeAddress: "456 Oak Avenue, Suite 200, City, State 12345",
    websiteUrl: null,
    linkedinUrl: null,
    licenseAuthority: "State Board of Psychology",
    education: {},
    certifications: {},
    servicesOffered: [],
    profileCompleteness: "Complete",
    createdAt: "2024-01-01T00:00:00Z"
  }
];

// Export fallback data for emergency use
export { fallbackPsychologists };

// Default export for backward compatibility
const psychologists = fallbackPsychologists;
export default psychologists;
