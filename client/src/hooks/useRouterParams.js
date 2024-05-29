import { useNavigate, useParams, useLocation } from "react-router-dom";

function useRouterParams() {
  const navigate = useNavigate();
  const location = useLocation();

  const { search } = location;
  const pathname = location.pathname;
  const queryParams = new URLSearchParams(search);

  const { collectionId, itemId } = useParams();
  const collectionUserId = queryParams.get("userId");

  return { navigate, pathname, collectionId, itemId, collectionUserId };
}

export default useRouterParams;
