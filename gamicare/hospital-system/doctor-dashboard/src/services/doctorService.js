import api from './api'

export const doctorService = {
  // Get doctor availability slots
  getAvailabilitySlots: async (date) => {
    try {
      const response = await api.get('/doctors/availability/slots', { params: { date } })
      return response.data
    } catch (error) {
      console.error('Error fetching availability:', error)
      throw error
    }
  },

  // Save availability slots
  saveAvailabilitySlots: async (slots) => {
    try {
      const response = await api.post('/doctors/availability/slots', { slots })
      return response.data
    } catch (error) {
      console.error('Error saving availability:', error)
      throw error
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const response = await api.put('/doctors/profile/update', data)
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }
}

export default doctorService
