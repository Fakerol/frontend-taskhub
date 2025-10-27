
export async function mockLogin(data){
    await new Promise(res => setTimeout(res, 1000));

    if (data.email === "admin@test.com" && data.password === "123456") {
    return {
      user: { id: 1, name: "Admin User", email: "admin@test.com", role: "owner" },
      token: "mock-jwt-token",
    };
  } else {
    throw new Error("Invalid credentials");
  }
}

export async function mockSignup(data) {
  await new Promise(res => setTimeout(res, 1000));
  return {
    user: { id: 2, name: data.name, email: data.email, role: "member" },
    token: "mock-jwt-token",
  };
}