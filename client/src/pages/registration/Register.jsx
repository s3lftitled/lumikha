import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../utils/api'
import './Register.css'

const Registration = () => {

  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    selectedProvince: '',
    selectedProvinceName: '',
    selectedMunicipality: '',
    selectedMunicipalityName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('https://psgc.gitlab.io/api/provinces/')
      .then(response => {
        setProvinces(response.data)
        setLoading(false)
      })
      .catch(error => {
        setError('Failed to load provinces.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (registrationData.selectedProvince) {
      console.log(registrationData.selectedProvince)
      setMunicipalities([])
      api
        .get(`https://psgc.gitlab.io/api/provinces/${registrationData.selectedProvince}/municipalities/`)
        .then(response => {
          setMunicipalities(response.data)
        })
        .catch(error => {
          setError('Failed to load cities.')
        })
    }
  }, [registrationData.selectedProvince])

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    // If the name is for a select (province or municipality), update the selected name as well
    if (name === 'selectedProvince') {
      const selectedProvince = provinces.find(province => province.code === value)
      setRegistrationData((prevData) => ({
        ...prevData,
        selectedProvince: value,
        selectedProvinceName: selectedProvince ? selectedProvince.name : '', 
      }))
    } else if (name === 'selectedMunicipality') {
      const selectedMunicipality = municipalities.find(municipality => municipality.code === value)
      setRegistrationData((prevData) => ({
        ...prevData,
        selectedMunicipality: value,
        selectedMunicipalityName: selectedMunicipality ? selectedMunicipality.name : '',
      }))
    } else {
      try {
        formattedValue = JSON.parse(value)
      } catch (error) {
        // Ignore parsing errors and keep the value as a string
      }

      setRegistrationData((prevData) => ({
        ...prevData,
        [name]: formattedValue,
      }))
    }
  }

  const navigateToLogin = () => {
    navigate('/login')
  }

  const handleSubmit = async () => {
    try {
      const response = await api.post('auth/registration', {
        firstName: registrationData.firstName,
        middleName: registrationData.middleName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        password: registrationData.password,
        passwordConfirmation: registrationData.passwordConfirmation,
        province: registrationData.selectedProvinceName,
        municipality: registrationData.selectedMunicipalityName
      })

      if (response.status === 201) {
        console.log(response)
        alert(response.data.message)
        console.log(response.data.message)
        navigate(`/verify-email/${registrationData.email}`)
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.error.message)
      } else {
        alert('An error occurred. Please try again.')
      }
    }
  }

  return (
    <>
      <div className="registration-page">
      <h1 className='lumikha-sign'>LUMIKHA</h1>
      <div className="registration-form">
        <h1>Register</h1>
        <form>
            <input
              type='text'
              name='firstName'
              placeholder='First Name'
              onChange={handleFieldChange}
            />
            <input
              type='text'
              name='middleName'
              placeholder='Middle Name'
              onChange={handleFieldChange}
            />
            <input
              type='text'
              name='lastName'
              placeholder='Last Name'
              onChange={handleFieldChange}
            />
            <input
              type='text'
              name='email'
              placeholder='yourname@gmail.com'
              onChange={handleFieldChange}
            />
            <input
              type='password'
              name='password'
              placeholder='Password'
              onChange={handleFieldChange}
            />
             <input
              type='password'
              name='passwordConfirmation'
              placeholder='Confirm Password'
              onChange={handleFieldChange}
            />
            <select
              name="selectedProvince"
              value={registrationData.selectedProvince}
              onChange={handleFieldChange}
              required
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            { registrationData.selectedProvince && 
                <select
                  name='selectedMunicipality'
                  value={registrationData.selectedMunicipality}
                  onChange={handleFieldChange}
                  required
                >
                <option>Select Municipality</option>
                {municipalities.map((municipality) => (
                  <option key={municipality.code} value={municipality.code}>
                    {municipality.name}
                  </option>
                ))}
                </select>
            }            
          </form>
          <div className="form-footer">
            <button onClick={handleSubmit}>Register</button>
            <button onClick={() => navigateToLogin()}>Back to Login</button>
        </div>
      </div>
      </div>
    </>
  )
}

export default Registration