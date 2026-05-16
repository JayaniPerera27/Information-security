export const roleRoutes = {
  admin: "/admin",
  lecturer: "/lecturer",
  exam_officer: "/exam-officer"
};

export const getRouteForRole = (role) => roleRoutes[role] || "/login";
