import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { SERVER_URL } from "../utils/config";
import axios from "axios";
import getTokenData from "../utils/getTokenData";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "antd";
import { useSelector } from "react-redux";
import defaultImage from "../assets/placeholder-image.png";
import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  headingsPlugin,
  linkPlugin,
  linkDialogPlugin,
  CreateLink,
} from "@mdxeditor/editor";
import { fileToBase64 } from "file64";
import MDEditor from "@uiw/react-md-editor";

const CollectionForm = ({ initialValues }) => {
  const { userId } = getTokenData();
  const { collectionId } = useParams();

  const [selectedImage, setSelectedImage] = useState(
    initialValues.image ? initialValues.image : defaultImage
  );

  useEffect(() => {
    setSelectedImage(initialValues.image);
  }, [initialValues]);

  const categories = useSelector((state) => state.collections.categories);

  const navigate = useNavigate();

  console.log("CF", initialValues);

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log(values.image);

    const image64 =
      values.image !== null
        ? values.image instanceof File
          ? await fileToBase64(values.image)
          : values.image.startsWith("http")
          ? values.image
          : ""
        : "";

    console.log("values", values);
    const updatedValuesWithBase64Image = {
      ...values,
      image: image64,
      createdBy: userId,
    };

    try {
      if (collectionId) {
        console.log(updatedValuesWithBase64Image);
        console.log("i am here");
        await axios.put(
          `${SERVER_URL}/api/collections/update/${collectionId}`,
          updatedValuesWithBase64Image
        );
        console.log("Collection updated successfully");
      } else {
        await axios.post(
          `${SERVER_URL}/api/collections/addCollection`,
          updatedValuesWithBase64Image
        );
        console.log("Collection added successfully");
      }
      navigate("/collections");
    } catch (error) {
      console.error("Error:", error);
    }

    setSubmitting(false);
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string(),
    category: Yup.string().required("Category is required"),
    image: Yup.mixed().nullable(),
  });

  //TODO:fix editor
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <div className="flex flex-col-reverse lg:flex-row lg:flex w-full">
          <div className="w-full">
            <Form>
              <div className="mb-4">
                <label htmlFor="title" className="block mb-2">
                  Title
                </label>
                <Field
                  type="text"
                  id="title"
                  name="title"
                  value={values.title}
                  onChange={(e) => {
                    setFieldValue("title", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  required
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block mb-2">
                  Description
                </label>
                {/* <Field name="description">
                  {({ field }) => {
                    console.log("Field value:", field.value);
                    return (
                      <MDEditor
                        id="description"
                        defaultValue={field.value}
                        value={values.description}
                        onChange={(value) => {
                          field.onChange({
                            target: {
                              name: field.name,
                              value: value,
                            },
                          });
                        }}
                      />
                    );
                  }}
                </Field> */}
                {/* <MDXEditor
                  id="description"
                  name="description"
                  markdown={values.description}
                  onChange={(value) => {
                    setFieldValue("description", value);
                  }}
                  plugins={[
                    linkPlugin(),
                    linkDialogPlugin(),
                    headingsPlugin(),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          <UndoRedo />
                          <BoldItalicUnderlineToggles />
                          <CreateLink />
                        </>
                      ),
                    }),
                  ]}
                /> */}
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={(e) => {
                    setFieldValue("description", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block mb-2">
                  Category
                </label>
                <Field
                  as="select"
                  id="category"
                  name="category"
                  value={values.category}
                  onChange={(e) => {
                    setFieldValue("category", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="category"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="image" className="block mb-2">
                  Image
                </label>
                <Input
                  type="file"
                  name="image"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith("image/")) {
                      setFieldValue("image", file);
                      const imageUrl = URL.createObjectURL(file);
                      setSelectedImage(imageUrl);
                    } else {
                      setFieldValue("image", null);
                      setSelectedImage(defaultImage);
                    }
                  }}
                />
                <ErrorMessage
                  name="image"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600"
              >
                {collectionId
                  ? isSubmitting
                    ? "Updating..."
                    : "Update collection"
                  : isSubmitting
                  ? "Adding..."
                  : "Add Collection"}
              </button>
            </Form>
          </div>
          <div>
            <img src={selectedImage} className="mr-4 rounded-lg" />
          </div>
        </div>
      )}
    </Formik>
  );
};

export default CollectionForm;
