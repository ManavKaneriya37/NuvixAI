import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "../redux/slices/user.slice";

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated, status } = useSelector((state) => state.user);

  useEffect(() => {
    if (status === "idle") dispatch(fetchCurrentUser());
  }, [dispatch, status]);

  useEffect(() => {
    if (status === "failed" && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [status, isAuthenticated, navigate, location.pathname]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-28 w-28 animate-[spin_1.4s_linear_infinite] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#60a5fa,#a855f7,#34d399,#60a5fa)] p-[6px] shadow-[0_0_30px_rgba(96,165,250,0.35)]">
            <div className="h-full w-full rounded-full bg-[#0A0A0B]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium tracking-[0.2em] text-white/80 uppercase">
              Loading
            </p>
            <p className="mt-1 text-xs text-gray-400">Checking your session</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthWrapper;
