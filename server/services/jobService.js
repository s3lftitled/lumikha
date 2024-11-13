const User = require('../models/user')
const Job = require('../models/job')
const logger = require('../logger/logger')
const JOB_TYPES = require('../constants/jobTypes')
const validator = require('validator')
const { isAfter } = require('date-fns') 

class JobService {

  async createJob(title, description, skillsRequired, deadline, maxApplicants, type, userId) {
    // Ensure required fields are provided and valid
    const requiredParams = { title, description, skillsRequired, deadline, maxApplicants, userId }
    if (Object.values(requiredParams).some(param => param === undefined || param === null)) {
      throw { status: 400, message: "Missing required fields: title, description, skillsRequired, deadline, and userId are required." }
    }

    // Log sanitized inputs (excluding sensitive data)
    logger.info(`Creating job with title: ${title} and type: ${type}`)

    // Validate and sanitize each input using validator functions

    // Check title - validate length and sanitize
    if (!validator.isLength(title, { min: 5, max: 100 }) || typeof title !== 'string') {
      throw { status: 400, message: "Title must be a string between 5 and 100 characters." }
    }
    title = validator.escape(title)  // Sanitize title to prevent special character injection

    // Check description - validate length and sanitize
    if (!validator.isLength(description, { min: 10 }) || typeof description !== 'string') {
      throw { status: 400, message: "Description must be a string with at least 10 characters." }
    }
    description = validator.escape(description)

    // Validate skillsRequired is an array of strings
    if (!Array.isArray(skillsRequired) || skillsRequired.some(skill => typeof skill !== 'string' || !validator.isAlphanumeric(skill.replace(/\s/g, '')))) {
      throw { status: 400, message: "SkillsRequired must be an array of alphanumeric strings." }
    }

    // Check deadline is a valid ISO date and in the future
    if (!validator.isISO8601(deadline.toString()) || !isAfter(new Date(deadline), new Date())) {
      throw { status: 400, message: "Deadline must be a valid future date." }
    }

    // Validate userId format if it's an ObjectId
    if (!validator.isMongoId(userId.toString())) {
      throw { status: 400, message: "Invalid userId format." }
    }

    // Validate maxApplicants
    if (maxApplicants !== undefined) {
      if (typeof maxApplicants !== 'number' || !Number.isInteger(maxApplicants) || maxApplicants <= 0) {
        throw { status: 400, message: "maxApplicants must be a positive integer." }
      }
    }

    if (!JOB_TYPES.includes(type)) {
      throw { status: 400, message: `Invalid job type. Available types: ${JOB_TYPES.join(', ')}` }
    }

    // Fetch and check if the user exists in the database
    const postedBy = await User.findById(userId);
    if (!postedBy) {
      throw { status: 404, message: 'User not found.' }
    }

    const job = new Job({
      title,
      description,
      skillsRequired,
      deadline: new Date(deadline),
      postedBy: userId,
      type
    })

    await job.save()
    logger.info(`User ${userId} successfully posted a job`)
  }

  async fetchJob(jobCategory) {

    // Log job category being fetched
    logger.info(`Fetching jobs for category: ${jobCategory}`)

    // Check if jobCategory is a string, has a minimum length of 5, and contains only alphanumeric characters
    if (!validator.isLength(jobCategory, { min: 5 }) || !validator.isAlphanumeric(jobCategory.replace(/\s/g, ''))) {
      throw { status: 400, message: 'Job category must be a string with at least 5 alphanumeric characters.' };
    }
  
    // Check if jobCategory exists in JOB_TYPES
    if (!JOB_TYPES.includes(jobCategory)) {
      throw { status: 400, message: `Invalid job category. Available categories: ${JOB_TYPES.join(', ')}` }
    }

    // Sanitize jobCategory to prevent any special characters or injection
    jobCategory = validator.escape(jobCategory)

    // Fetch jobs by category
    const jobs = await Job.find({ type: jobCategory })
  
    // Check if jobs exist for the given category
    if (!jobs || jobs.length === 0) {
      throw { status: 400, message: 'Job category currently has no jobs' }
    }
  
    // Return the jobs to the user
    return jobs
  }  
}

module.exports = new JobService()