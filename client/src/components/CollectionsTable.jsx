import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ToolBar from "./Toolbar/ToolBar";
import ToolButton from "./Toolbar/ToolButton";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { useCollectionActions } from "../hooks/useCollectionActions";
import axios from "axios";
import { SERVER_URL } from "../utils/config";
import { setCollections } from "../store/collectionsSlice";
import Spinner from "./Spinner";
import { useDispatch } from "react-redux";
import { useCollections } from "../hooks/useCollections";

export default function CollectionCard() {
  const navigate = useNavigate();
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const dispatch = useDispatch();

  const { selectedImage, setSelectedImage } = useCollectionActions(dispatch);
  const { collections, fetchUserCollections, isLoading, error } =
    useCollections();

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
    navigate(`/collections/update/${collectionId}`);
  };

  const handleRowClick = (collectionId) => {
    navigate(`/collections/${collectionId}/items`);
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

      fetchUserCollections();
      setSelectedCollections([]);
    } catch (error) {
      console.error("Error deleting collections:", error);
    }
  };

  return (
    <>
      <ToolBar>
        <ToolButton
          title="Add"
          handleAction={() => navigate("/collections/add")}
        >
          Add
        </ToolButton>
        <ToolButton
          handleAction={() =>
            handleDeleteCollections(
              selectedCollections.length > 0 ? undefined : selectedCollections
            )
          }
        >
          Delete all
        </ToolButton>
      </ToolBar>
      <div className="flex flex-col h-full overflow-x-auto relative border rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y border-collapse border-b divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="h-12 text-center divide-gray-200">
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {collections.length > 0 && (
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  )}
                </th>
                <th className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="h-full w-full bg-white divide-y divide-gray-200">
              {collections.map((collection) => (
                <tr
                  key={collection._id}
                  className="text-left hover:bg-gray-100 cursor-pointer h-16"
                  onClick={() => handleRowClick(collection._id)}
                >
                  <td className="px-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5"
                      checked={selectedCollections.includes(collection._id)}
                      onChange={() => handleSelectCollection(collection._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 whitespace-nowrap w-1/8">
                    {collection._id}
                  </td>
                  <td className="px-4 whitespace-nowrap w-1/4">
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-auto"
                    />
                  </td>
                  <td className="px-4 text-center whitespace-nowrap w-1/4">
                    {collections.includes(collection._id) ? (
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5"
                        checked={selectedCollections.includes(collection._id)}
                        onChange={() => handleSelectCollection(collection._id)}
                      />
                    ) : (
                      collection.title
                    )}
                  </td>

                  <td className="px-4 text-center whitespace-nowrap w-1/4">
                    {collection.category}
                  </td>
                  <td className="text-center px-4 whitespace-nowrap w-1/4">
                    <ReactMarkdown>
                      {collection.description
                        ? collection.description
                        : "No description"}
                    </ReactMarkdown>
                  </td>
                  <td className="text-center px-4 whitespace-nowrap w-1/4">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading && collections.length === 0 && (
          <div
            div
            className="flex flex-1 h-full justify-center items-center text-gray-500"
          >
            <Spinner />
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-1 h-full justify-center items-center text-gray-500">
            <div className="text-center text-red-500">
              Error: {error.message}
            </div>
          </div>
        )}
        {collections.length === 0 && !isLoading && !error && (
          <div className="flex flex-1 h-full justify-center items-center text-gray-500">
            No collections found. Create a new collection to get started!
          </div>
        )}
      </div>
    </>
  );
}