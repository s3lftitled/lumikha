const nodemailer = require('nodemailer')
const crypto = require('crypto')
const logger = require('../logger/logger')
require('dotenv').config()

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    })
  }

  async sendVerificationEmail(email, verificationCode) {
    try {
      const mailOptions = {
        from: process.env.USER,
        to: email,
        subject: 'Email Verification',
        html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
      }

      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      logger.error('Error sending verification email:', error.message)
      throw new Error('Failed to send verification email.')
    }
  }

  async sendApplicationEmail(email, applicantName, applicantEmail) {
    try {
      const mailOptions = {
        from: process.env.USER,
        to: email,
        subject: 'New Job Application Notification',
        html: `
          <p>Hello,</p>
          <p>You have a new application for the job position. Below are the details:</p>
          <p><strong>Applicant Name:</strong> ${applicantName}</p>
          <p><strong>Applicant Email:</strong> ${applicantEmail}</p>
          <p>Thank you for reviewing the application.</p>
          <p>Best regards,</p>
          <p>Lumikha</p>
        `,
      }
  
      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      logger.error('Error sending application notification email:', error.message)
      throw new Error('Failed to send application notification email.')
    }
  }

  async notifyEmployerAboutCandidate(employerName, employerEmail, applicantFullName, applicantEmail, jobTitle) {
    try {
      const mailOptions = {
        from: process.env.USER,
        to: employerEmail,
        subject: 'Details of Your Chosen Candidate',
        html: `
          <p>Dear ${employerName},</p>
          <p>You have successfully chosen a candidate for the position of <strong>${jobTitle}</strong>.</p>
          <p>Here are the details of the selected applicant:</p>
          <ul>
            <li><strong>Name:</strong> ${applicantFullName}</li>
            <li><strong>Email:</strong> ${applicantEmail}</li>
          </ul>
          <p>Thank you for using our platform to find the right talent for your team.</p>
          <p>Best regards,</p>
          <p>Lumikha</p>
        `,
      }
  
      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      logger.error('Error notifying employer about chosen candidate:', error)
      throw new Error('Failed to send employer notification email.')
    }
  }  

  async sendJobOfferEmail(employerName, employerEmail, applicantName, applicantEmail, jobTitle) {
    try {
      const mailOptions = {
        from: process.env.USER,
        to: applicantEmail,
        subject: 'Congratulations! You’ve Received a Job Offer',
        html: `
          <p>Dear ${applicantName},</p>
          <p>We are excited to inform you that you have been offered the position of <strong>${jobTitle}</strong>!</p>
          <p>This offer is extended by <strong>${employerName}</strong> (${employerEmail}).</p>
          <p>We look forward to having you on the team!</p>
          <p>Best regards,</p>
          <p>Lumikha</p>
        `,
      }
  
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      logger.error('Error sending job offer email:', error.message)
      throw new Error('Failed to send job offer email.')
    }
  }  
  
  generateVerificationCode() {
    return crypto.randomBytes(3).toString('hex')
  }

  validateEmail(email) {
    const re = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/
    const isValid = re.test(String(email).toLowerCase())
    return { isValid }
  }
  
  maskEmail(email) {
    const [localPart, domain] = email.split('@')
    const maskedLocalPart = localPart.length > 2 ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1] : localPart
    return `${maskedLocalPart}@${domain}`
  }
}

module.exports = new EmailService()
