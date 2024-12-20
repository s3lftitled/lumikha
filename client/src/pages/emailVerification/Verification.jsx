import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SuccessAlert from '../../components/Alerts/SuccessAlert/SuccessAlerts'
import api from '../../../utils/api'
import './Verification.css'

const Verification = () => {
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { email } = useParams()
  const navigate = useNavigate()
  const [ successMsg, setSuccessMsg ] = useState(null)

  const handleInputChange = (e) => {
    setVerificationCode(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post(`/auth/verify-email/${email}`, { verificationCode })
      if (response.status === 200) {
        setSuccessMsg('Verification Succesful!')
        setTimeout(() => {
          navigate('/login')
        }, 3000) 
      }
    } catch (err) {
      setError('Invalid verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verification-page">
      { successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg(null)} /> }
      <h1 className="lumikha-sign">LUMIKHA</h1>
      <div className="verification-form">
        <h1>Email Verification</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="verificationCode"
            placeholder="Enter Verification Code"
            value={verificationCode}
            onChange={handleInputChange}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <div className="form-footer">
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button onClick={() => navigate('/login')}>Back to Login</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Verification
