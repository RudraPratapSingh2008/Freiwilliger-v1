
/**
 * Helper to get age range from exact age (floor to 5-year bracket)
 * @param {number} age 
 * @returns {string} e.g., "20–25"
 */
const getAgeRange = (age) => {
  if (!age) return "Unknown";
  const floor = Math.floor(age / 5) * 5;
  return `${floor}–${floor + 5}`;
};

/**
 * Helper to calculate skills match percentage
 * @param {string[]} volunteerSkills 
 * @param {string[]} requiredSkills 
 * @returns {number} percentage
 */
const calcSkillsMatch = (volunteerSkills = [], requiredSkills = []) => {
  if (requiredSkills.length === 0) return 100;
  const matches = volunteerSkills.filter(skill => 
    requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
  );
  return Math.round((matches.length / requiredSkills.length) * 100);
};

/**
 * Filter profile data based on viewer role and target user preferences
 * @param {Object} targetUser - The user whose profile is being viewed
 * @param {string} viewerRole - The role of the person viewing ('volunteer' or 'organiser')
 * @param {boolean} isApplicantView - Whether this is viewed in the context of an event application
 * @returns {Object} Filtered user object
 */
const filterProfileForViewer = (targetUser, viewerRole, isApplicantView = false) => {
  if (!targetUser) return null;

  const { role, visibilityPrefs = {} } = targetUser;
  const volunteer = targetUser.volunteerProfile || {};
  const organiser = targetUser.organiserProfile || {};
  const volunteerAddress = volunteer.address || {};
  const filtered = {
    _id: targetUser._id,
    username: targetUser.username,
    role: targetUser.role,
  };

  // Common fields for all public views
  filtered.photo = volunteer.profilePhoto || organiser.profilePhoto || organiser.logo || targetUser.photo;
  
  if (role === 'volunteer') {
    // Basic Volunteer Info
    filtered.name = volunteer.fullName || targetUser.username;
    filtered.gender = volunteer.gender;
    filtered.skills = volunteer.skills || [];
    filtered.languages = volunteer.languages || [];
    filtered.reviews = volunteer.reviews || [];

    // Respect visibility preferences
    if (visibilityPrefs.showCity !== false) filtered.city = volunteerAddress.city || targetUser.location?.city;
    if (visibilityPrefs.showHelpScore !== false) filtered.helpScore = volunteer.helpScore;
    if (visibilityPrefs.showWorkHistory !== false) filtered.pastExperience = volunteer.pastExperience || [];

    // Organiser viewing volunteer gets extra fields
    if (viewerRole === 'organiser') {
      filtered.ageRange = getAgeRange(volunteer.age);
      filtered.qualification = volunteer.qualification;
    }

    // Applicant specific fields
    if (isApplicantView) {
      filtered.applicationDate = targetUser.applicationDate;
      filtered.isReturningVolunteer = targetUser.isReturningVolunteer;
      // Note: skillsMatchPercent should be calculated by the caller using calcSkillsMatch
    }

  } else if (role === 'organiser') {
    // Organiser Info
    filtered.name = organiser.companyName || organiser.fullName || targetUser.username;
    filtered.logo = organiser.logo || organiser.profilePhoto || targetUser.photo;
    filtered.hireScore = organiser.hireScore;
    filtered.city = targetUser.location?.city;
    filtered.pastEvents = organiser.pastEvents || [];
    filtered.volunteerCount = organiser.volunteerCount || 0;
    filtered.reviews = organiser.reviews || [];
  }

  // Phone and Email are NEVER returned in public view
  delete filtered.phone;
  delete filtered.email;
  delete filtered.password;
  delete filtered.refreshTokens;
  delete filtered.firebaseUid;

  return filtered;
};

module.exports = {
  filterProfileForViewer,
  getAgeRange,
  calcSkillsMatch
};
