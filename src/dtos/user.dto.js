export const bodyToUserSignup = (body) => {
  return {
    name: body.name,
    gender: body.gender,
    birth: body.birth ? new Date(body.birth) : null,
    address: body.address || "",
    socialId: body.socialId || null,
    socialType: body.socialType || null,
    email: body.email,
    phone: body.phone || "",
    password: body.password,
    preferences: body.preferences || []
  };
};

export const responseFromUserSignup = (user) => {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    userStatus: user.userStatus,
    userType: user.userType,
    createdAt: user.createdAt
  };
};

export const bodyToUserUpdate = (body) => {
  return {
    name: body.name,
    gender: body.gender,
    birth: body.birth,
    address: body.address,
    phone: body.phone,
    preferences: body.preferences || []
  };
};

export const responseFromUserUpdate = (user) => {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    gender: user.gender,
    birth: user.birth,
    address: user.address,
    phone: user.phone,
    userStatus: user.userStatus,
    userType: user.userType,
    updatedAt: user.updatedAt
  };
};
