import { Link } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ToolBar from "./Toolbar/ToolBar";
import ToolButton from "./Toolbar/ToolButton";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "../utils/config";
import Spinner from "./Spinner";
import { useFetchCollections } from "../hooks/useFetchCollections";
import getTokenData from "../utils/getTokenData";
import TablePagination from "./TablePagination";
import Filter from "./Filter";
import useFilter from "../hooks/useFilter";
import { useDebounce } from "../hooks/useDebounce";
import useRouterParams from "../hooks/useRouterParams";

export default function CollectionsTable() {
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { values, selectedValue, setSelectedValues } = useFilter(
    "collections/categories"
  );
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 500);

  const { isAdmin, userId } = getTokenData();

  const { navigate, collectionId, collectionUserId } = useRouterParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const {
    collections,
    fetchUserCollections,
    totalCollections,
    isLoading,
    error,
  } = useFetchCollections();

  useEffect(() => {
    fetchUserCollections(
      collectionUserId,
      currentPage,
      pageSize,
      selectedValue,
      debouncedSearchText
    );
  }, [
    collectionUserId,
    currentPage,
    pageSize,
    selectedValue,
    debouncedSearchText,
  ]);

  useEffect(() => {
    if (
      selectedCollections.length === collections.length &&
      collections.length !== 0
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedCollections, collections]);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedCollections(collections.map((collection) => collection._id));
    } else {
      setSelectedCollections([]);
    }
  };

  const handleSelectCollection = (collectionId) => {
    if (selectedCollections.includes(collectionId)) {
      setSelectedCollections(
        selectedCollections.filter((id) => id !== collectionId)
      );
    } else {
      setSelectedCollections([...selectedCollections, collectionId]);
    }
  };

  const handleEditCollection = (collectionId) => {
    navigate(`/collections/update/${collectionId}?userId=${collectionUserId}`);
  };

  const handleRowClick = (collectionId) => {
    navigate(`/collections/${collectionId}/items?userId=${collectionUserId}`);
  };

  const handleDeleteCollections = async (collectionId) => {
    const collectionIdsToDelete = collectionId ? [collectionId] : [];

    const selectedIds =
      collectionIdsToDelete.length > 0
        ? collectionIdsToDelete
        : selectedCollections;

    try {
      await axios.delete(`${SERVER_URL}/api/collections/delete`, {
        data: { collectionsIds: selectedIds },
      });

      fetchUserCollections(
        collectionUserId,
        currentPage,
        pageSize,
        selectedValue,
        debouncedSearchText
      );
      setSelectedCollections([]);
    } catch (error) {
      console.error("Error deleting collections:", error);
    }
  };

  const isHaveRightToChange =
    userId && (isAdmin || (userId === collectionUserId && !isAdmin));

  return (
    <>
      <div className="flex justify-between flex-wrap md:flex-nowrap mb-2 md:mb-0">
        {isHaveRightToChange && (
          <ToolBar>
            <ToolButton
              title="Add"
              handleAction={() =>
                navigate(
                  `/collections/add?userId=${collectionUserId}${
                    collectionId ? `&&collectionId=${collectionId}` : ""
                  }`
                )
              }
            >
              Add
            </ToolButton>
            <ToolButton
              handleAction={() =>
                handleDeleteCollections(
                  selectedCollections.length > 0
                    ? undefined
                    : selectedCollections
                )
              }
            >
              Delete all
            </ToolButton>
          </ToolBar>
        )}
        <div className="flex self-center mb-4">
          <Filter
            values={values}
            selectedValue={selectedValue}
            setSelectedValues={setSelectedValues}
          />
          <input
            className="w-full px-3 lg:w-auto text-gray-600 dark:text-white  border-2 border-gray-300 dark:bg-gray-800/[.3] h-10 rounded-lg text-sm focus:outline-none"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search..."
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-1 h-full justify-center items-center text-gray-500">
          <Spinner />
        </div>
      )}
      {!isLoading && collections.length === 0 && !error && (
        <div className="flex flex-1 h-full justify-center items-center text-gray-500">
          {isHaveRightToChange
            ? "No collections found. Create a new collection to get started!"
            : "No collections found. User has not created any collection yet"}
        </div>
      )}
      {error && !isLoading && (
        <div className="flex flex-1 h-full justify-center items-center text-gray-500">
          <div className="text-center text-red-500">Error: {error.message}</div>
        </div>
      )}
      {!isLoading && collections.length > 0 && (
        <div className="flex flex-1 w-full overflow-x-auto relative border rounded-md">
          <div className="flex flex-1 flex-col w-full overflow-x-auto overflow-y-scroll">
            <table className="h-full min-w-full divide-y border-collapse border-b divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-800/[.7]">
                <tr className="h-16 text-center text-gray-600 dark:text-white divide-gray-200">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider">
                    {collections.length > 0 && isHaveRightToChange && (
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    )}
                  </th>
                  <th className="px-4 text-xs font-medium uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 text-xs font-medium uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 text-xs font-medium uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 text-xs font-medium uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 text-xs font-medium uppercase tracking-wider">
                    {isHaveRightToChange ? "Actions" : null}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {collections.map((collection) => (
                  <tr
                    key={collection._id}
                    className="h-fit text-left hover:bg-gray-100 dark:hover:bg-gray-800/[.3] cursor-pointer"
                    onClick={() => handleRowClick(collection._id)}
                  >
                    <td className="px-4 whitespace-nowrap">
                      {isHaveRightToChange && (
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5"
                          checked={selectedCollections.includes(collection._id)}
                          onChange={() =>
                            handleSelectCollection(collection._id)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      <Link to={`/collections/${collectionId}/`}>
                        {collection._id}
                      </Link>
                    </td>
                    <td className="px-4 text-center whitespace-nowrap w-2/12">
                      <img src={collection.image} alt={collection.title} />
                    </td>
                    <td className="px-4 text-center whitespace-nowrap">
                      {collections.includes(collection._id) ? (
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5"
                          checked={selectedCollections.includes(collection._id)}
                          onChange={() =>
                            handleSelectCollection(collection._id)
                          }
                        />
                      ) : (
                        collection.title
                      )}
                    </td>

                    <td className="px-4 text-center whitespace-nowrap">
                      {collection.category}
                    </td>
                    <td className="text-center px-4 whitespace-nowrap">
                      <ReactMarkdown>
                        {collection.description
                          ? collection.description
                          : "No description"}
                      </ReactMarkdown>
                    </td>
                    <td className="text-center px-4 whitespace-nowrap">
                      {isHaveRightToChange && (
                        <>
                          <button
                            onClick={(e) => {
                              handleEditCollection(collection._id);
                              e.stopPropagation();
                            }}
                          >
                            <EditOutlined className="text-2xl mr-4 text-gray-500 hover:text-gray-700" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCollections(collection._id);
                            }}
                          >
                            <DeleteOutlined className="text-2xl text-gray-500 hover:text-gray-700" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalCollections}
        handlePageChange={handlePageChange}
      />
    </>
  );
}
