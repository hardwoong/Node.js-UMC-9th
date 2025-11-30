import { prisma } from "../config/prisma.config.js";
import bcrypt from "bcrypt";
import { EmailAlreadyExistsError, InternalServerError } from "../errors/custom-error.js";

export const addUser = async (data) => {
  try {
    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    // 이미 존재하는 사용자인 경우 정보 업데이트 (소셜 로그인 사용자 정보 보완)
    if (existingUser) {
      // 소셜 로그인 사용자인 경우에만 업데이트 허용
      if (existingUser.socialType && !data.password) {
        // 소셜 로그인 사용자 정보 업데이트
        const updateData = {};
        if (data.name) updateData.name = data.name;
        if (data.gender) updateData.gender = data.gender;
        if (data.birth) updateData.birth = new Date(data.birth);
        if (data.address !== undefined) updateData.address = data.address;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.preferences && data.preferences.length > 0) {
          // 기존 선호 카테고리 삭제 후 새로 추가
          await prisma.usersPrefer.deleteMany({
            where: { userId: existingUser.userId }
          });
          
          updateData.usersPrefer = {
            create: data.preferences.map(categoryId => ({
              categoryId: BigInt(categoryId)
            }))
          };
        }

        const updatedUser = await prisma.user.update({
          where: { userId: existingUser.userId },
          data: updateData
        });

        return Number(updatedUser.userId);
      } else {
        // 일반 회원가입인 경우 중복 에러
        throw new EmailAlreadyExistsError();
      }
    }

    // 비밀번호 해싱
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // 사용자 추가 (트랜잭션 사용)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        password: hashedPassword,
        gender: data.gender,
        birth: new Date(data.birth),
        address: data.address,
        socialId: data.socialId,
        socialType: data.socialType,
        email: data.email,
        phone: data.phone,
        userStatus: 'ACTIVE',
        userType: 'GENERAL',
        agreements: {
          create: {
            isServiceAgreed: true,
            isPersonalAgreed: true,
            isLocationAgreed: true,
            isAlarmAgreed: true,
            isFourteenAgreed: true,
          }
        },
        usersPrefer: data.preferences && data.preferences.length > 0 ? {
          create: data.preferences.map(categoryId => ({
            categoryId: BigInt(categoryId)
          }))
        } : undefined
      }
    });

    return Number(user.userId);
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`회원가입 중 오류가 발생했습니다: ${err.message}`);
  }
};

export const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: BigInt(userId) },
      select: {
        userId: true,
        name: true,
        email: true,
        userStatus: true,
        userType: true,
        createdAt: true,
      }
    });

    if (!user) return null;

    return {
      ...user,
      userId: Number(user.userId)
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`사용자 조회 중 오류가 발생했습니다: ${err.message}`);
  }
};

export const updateUser = async (userId, data) => {
  try {
    const updateData = {};
    
    if (data.name) updateData.name = data.name;
    if (data.gender) updateData.gender = data.gender;
    if (data.birth) updateData.birth = new Date(data.birth);
    if (data.address !== undefined) updateData.address = data.address;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.preferences && data.preferences.length > 0) {
      // 기존 선호 카테고리 삭제 후 새로 추가
      await prisma.usersPrefer.deleteMany({
        where: { userId: BigInt(userId) }
      });
      
      updateData.usersPrefer = {
        create: data.preferences.map(categoryId => ({
          categoryId: BigInt(categoryId)
        }))
      };
    }

    const user = await prisma.user.update({
      where: { userId: BigInt(userId) },
      data: updateData,
      select: {
        userId: true,
        name: true,
        email: true,
        gender: true,
        birth: true,
        address: true,
        phone: true,
        userStatus: true,
        userType: true,
        updatedAt: true,
      }
    });

    return {
      ...user,
      userId: Number(user.userId),
      birth: user.birth ? user.birth.toISOString().split('T')[0] : null
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`사용자 정보 수정 중 오류가 발생했습니다: ${err.message}`);
  }
};
