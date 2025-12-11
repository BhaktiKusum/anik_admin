// admin/src/pages/businesses/BusinessListPage.js
import React, { useEffect, useState } from "react";
import TextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";
import { getFileUrl } from './../../utils/fileUrl';
import {

  adminGetBusinesses,
  adminGetBusinessDetail,
  adminCreateBusiness,
  adminUpdateBusiness,
  adminDeleteBusiness,
  adminAddBusinessImage,
  adminUpdateBusinessImage,
  adminDeleteBusinessImage,
} from "../../api/adminBusinessApi";

function BusinessListPage() {
  const [businesses, setBusinesses] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // NEW: pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });


  // Business modal state
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [businessForm, setBusinessForm] = useState({
    type: "RESTAURANT",
    name: "",
    address: "",
    google_start: "",
  });
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Images panel state
  const [imagePanelBusiness, setImagePanelBusiness] = useState(null);
  const [images, setImages] = useState([]);
  const [imageForm, setImageForm] = useState({
    business_images_id: null,
    file: null,
    sort_order: "",
  });

  const [savingImage, setSavingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  useEffect(() => {
    loadBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBusinesses(pageOverride, searchOverride, typeOverride) {
    try {
      setLoading(true);
      setError("");

      // const pageToUse =  pagination.page ?? 1;


    const pageToUse = pageOverride ?? pagination.page ?? 1;
    const searchToUse = searchOverride ?? search ?? "";
    const typeToUse = typeOverride ?? typeFilter ?? "";

      const data = await adminGetBusinesses({
        page: pageToUse,
        page_size: pagination.page_size,
        type: typeFilter || undefined,
        search: search || undefined,
      });
      
      setBusinesses(data.businesses || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      console.error(err);
      setError("Failed to load businesses.");
    } finally {
      setLoading(false);
    }
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadBusinesses();
  };

  // -------- Business Modal Logic --------

  const openCreateBusiness = () => {
    setEditingBusiness(null);
    setBusinessForm({
      type: "RESTAURANT",
      name: "",
      address: "",
      google_start: "",
    });
    setIsBusinessModalOpen(true);
  };

  const openEditBusiness = (b) => {
    setEditingBusiness(b);
    setBusinessForm({
      type: b.type,
      name: b.name,
      address: b.address || "",
      google_start: b.google_start || "",
    });
    setIsBusinessModalOpen(true);
  };

  const closeBusinessModal = () => {
    setIsBusinessModalOpen(false);
    setEditingBusiness(null);
    setBusinessForm({
      type: "RESTAURANT",
      name: "",
      address: "",
      google_start: "",
    });
  };

  const handleBusinessFormChange = (e) => {
    const { name, value } = e.target;
    setBusinessForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitBusinessForm = async (e) => {
    e.preventDefault();
    setError("");

    if (!businessForm.name.trim()) {
      setError("Business name is required.");
      return;
    }

    try {
      setSavingBusiness(true);
      const payload = {
        type: businessForm.type,
        name: businessForm.name,
        address: businessForm.address,
        google_start: businessForm.google_start,
      };

      if (editingBusiness) {
        await adminUpdateBusiness(editingBusiness.business_id, payload);
      } else {
        await adminCreateBusiness(payload);
      }

      closeBusinessModal();
      loadBusinesses();
    } catch (err) {
      console.error(err);
      setError("Failed to save business.");
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!window.confirm("Delete this business and its images?")) return;
    try {
      await adminDeleteBusiness(businessId);
      loadBusinesses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete business.");
    }
  };

  // -------- Images Panel Logic --------

  const openImagesPanel = async (b) => {
    try {
      setImagePanelBusiness(b);
      setSavingImage(false);
      setImageForm({
        business_images_id: null,
        image_url: "",
        sort_order: "",
      });

      const detail = await adminGetBusinessDetail(b.business_id);
      setImages(detail.images || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load business images.");
    }
  };

  const closeImagesPanel = () => {
    setImagePanelBusiness(null);
    setImages([]);
    setImageForm({
      business_images_id: null,
      image_url: "",
      sort_order: "",
    });
  };

  const handleImageFormChange = (e) => {
    const { name, value } = e.target;
    setImageForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEditImage = (img) => {
    setImageForm({
        business_images_id: img.business_images_id,
        file: null, // will set if user uploads new file
        sort_order: img.sort_order ?? "",
    });
  };


  const cancelEditImage = () => {
    setImageForm({
        business_images_id: null,
        file: null,
        sort_order: "",
    });
  };


  const submitImageForm = async (e) => {
    e.preventDefault();
    if (!imagePanelBusiness) return;

    // For new image, file is required
    if (!imageForm.business_images_id && !imageForm.file) {
        alert("Please select an image file.");
        return;
    }

    try {
        setSavingImage(true);
        const payload = {
        file: imageForm.file || null,
        sort_order: imageForm.sort_order ? Number(imageForm.sort_order) : 0,
        };

        if (imageForm.business_images_id) {
        await adminUpdateBusinessImage(imageForm.business_images_id, payload);
        } else {
        await adminAddBusinessImage(imagePanelBusiness.business_id, payload);
        }

        // reload images
        const detail = await adminGetBusinessDetail(imagePanelBusiness.business_id);
        setImages(detail.images || []);

        cancelEditImage();
    } catch (err) {
        console.error(err);
        alert("Failed to save image.");
    } finally {
        setSavingImage(false);
    }
  };


  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Delete this image?")) return;
    if (!imagePanelBusiness) return;

    try {
      await adminDeleteBusinessImage(imageId);
      const detail = await adminGetBusinessDetail(imagePanelBusiness.business_id);
      setImages(detail.images || []);
    } catch (err) {
      console.error(err);
      alert("Failed to delete image.");
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setImageForm((prev) => ({
        ...prev,
        file,
    }));
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };


  const formatDate = (value) =>{
    if (!value) return "-";
    const date = (new Date(value).getMonth()+1) + "/"+ new Date(value).getDate() + "/"+ new Date(value).getFullYear()
    return date
  }

  const totalPages = Math.max(
  1,
  Math.ceil((pagination.total || 0) / (pagination.page_size || 20))
);


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Businesses
          </h1>
          <p className="text-sm text-slate-600">
            Manage restaurants, hotels, and gyms that appear in the client home
            tasks for review.
          </p>
        </div>
        <Button onClick={openCreateBusiness}>Add Business</Button>
      </div>

      {/* Filters */}
      <form
        className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 border shadow-sm text-xs"
        onSubmit={handleFilterSubmit}
      >
        <div className="w-full sm:w-40">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Type
          </label>
          {/* <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="">All</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="HOTEL">Hotel</option>
            <option value="GYM">Gym</option>
          </select> */}
          <select
  value={typeFilter}
  onChange={(e) => {
    const newType = e.target.value;
    setTypeFilter(newType);
    // reload from first page with new type & current search
    loadBusinesses(1, search, newType);
    
  }}
  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
>

  <option value="">All</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="HOTEL">Hotel</option>
            <option value="GYM">Gym</option>

  </select>

        </div>

        <div className="w-full sm:w-64">
          <TextInput
            label="Search (name, address)"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type keyword..."
          />
        </div>
        

        <Button type="submit" className="h-9 px-4">
          Apply
        </Button>
      </form>


<span className="text-xs text-slate-500">
  Total: {pagination.total || 0}
</span>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div>Loading businesses...</div>
      ) : (
        <div className="rounded-xl bg-white border shadow-sm overflow-hidden text-xs">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Address</th>
                <th className="px-3 py-2">Google Star</th>
                <th className="px-3 py-2">Images</th>
                <th className="px-3 py-2">Created</th>
                {/* <th className="px-3 py-2">Task Date</th> */}
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {businesses.map((b) => (
                <tr key={b.business_id}>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {b.business_id}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[11px] font-medium uppercase text-slate-700">
                      {b.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">{b.name}</td>
                  <td className="px-3 py-2 max-w-xs truncate">
                    {b.address}
                  </td>
                  <td className="px-3 py-2">{b.google_start || "-"}</td>
                  
                  <td className="px-3 py-2">
                    {b.image_count || 0} image
                    {(b.image_count || 0) !== 1 ? "s" : ""}
                  </td>
                  <td className="px-3 py-2">
                    {formatDateTime(b.created_at)}
                  </td>
                  <td className="px-3 py-2 text-right space-x-1">
                    <button
                      className="rounded border border-slate-300 px-2 py-0.5 text-[11px] hover:bg-slate-100"
                      onClick={() => openEditBusiness(b)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded border border-sky-300 px-2 py-0.5 text-[11px] text-sky-700 hover:bg-sky-50"
                      onClick={() => openImagesPanel(b)}
                    >
                      Images
                    </button>
                    <button
                      className="rounded border border-red-300 px-2 py-0.5 text-[11px] text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteBusiness(b.business_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {businesses.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-4 text-center text-xs text-slate-500"
                  >
                    No businesses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Business modal (NOW controlled by isBusinessModalOpen) */}
      {isBusinessModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg text-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">
                  {editingBusiness ? "Edit Business" : "Create Business"}
                </div>
              </div>
              <button
                className="text-xs text-slate-500 hover:text-slate-800"
                onClick={closeBusinessModal}
              >
                ✕
              </button>
            </div>

            <form className="space-y-3" onSubmit={submitBusinessForm}>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Type
                </label>
                <select
                  name="type"
                  value={businessForm.type}
                  onChange={handleBusinessFormChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="GYM">Gym</option>
                </select>
              </div>

              <TextInput
                label="Name"
                name="name"
                value={businessForm.name}
                onChange={handleBusinessFormChange}
              />

              <TextInput
                label="Address"
                name="address"
                value={businessForm.address}
                onChange={handleBusinessFormChange}
              />

              <TextInput
                label="Google Star (optional)"
                name="google_start"
                value={businessForm.google_start}
                onChange={handleBusinessFormChange}
                placeholder="e.g. 4.5"
              />
              

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1 text-[11px]"
                  onClick={closeBusinessModal}
                >
                  Cancel
                </button>
                <Button type="submit" loading={savingBusiness}>
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Images panel (unchanged, already works off imagePanelBusiness) */}
      {imagePanelBusiness && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-lg text-xs max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">
                  Images for {imagePanelBusiness.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  Business ID: {imagePanelBusiness.business_id} • Type:{" "}
                  {imagePanelBusiness.type}
                </div>
              </div>
              <button
                className="text-xs text-slate-500 hover:text-slate-800"
                onClick={closeImagesPanel}
              >
                ✕
              </button>
            </div>

            {/* Existing images */}
            <div className="mb-3">
              <div className="text-[11px] font-semibold text-slate-600 mb-1">
                Existing Images
              </div>
              {images.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-3 py-3 text-[11px] text-slate-500">
                  No images yet. Add at least 1 image to show on client home.
                </div>
              ) : (
                <table className="min-w-full text-[11px] border rounded-md overflow-hidden">
                  <thead className="bg-slate-50 text-left uppercase text-slate-500">
                    <tr>
                      <th className="px-2 py-1">ID</th>
                      <th className="px-2 py-1">Preview</th>
                      <th className="px-2 py-1">URL</th>
                      <th className="px-2 py-1">Sort</th>
                      <th className="px-2 py-1 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {images.map((img) => (
                      <tr key={img.business_images_id}>
                        <td className="px-2 py-1">
                          {img.business_images_id}
                        </td>
                        {/* <td className="px-2 py-1">
                          <div className="h-10 w-16 overflow-hidden rounded bg-slate-100">
                            <img
                              src= {`http://localhost:1000${img.image_url}`}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </td> */}
                        <td className="px-2 py-1">
                            <button
                                type="button"
                                className="h-10 w-16 overflow-hidden rounded bg-slate-100 border border-slate-200"
                                onClick={() => setPreviewImageUrl(img.image_url)}
                                title="Click to view large"
                            >
                                <img
                                //src={`http://localhost:1000${img.image_url}`}
                                src={getFileUrl(img.image_url)}

                                alt=""
                                className="h-full w-full object-cover"
                                />
                            </button>
                        </td>

                        <td className="px-2 py-1 max-w-xs truncate">
                          {`${img.image_url}`}
                        </td>
                        <td className="px-2 py-1">
                          {img.sort_order ?? 0}
                        </td>
                        <td className="px-2 py-1 text-right space-x-1">
                          <button
                            className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100"
                            onClick={() => startEditImage(img)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded border border-red-300 px-2 py-0.5 text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteImage(img.business_images_id)
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Add / Edit image form */}
            {/* <div className="border-t pt-3">
              <div className="text-[11px] font-semibold text-slate-600 mb-2">
                {imageForm.business_images_id ? "Edit Image" : "Add New Image"}
              </div>

              <form
                className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
                onSubmit={submitImageForm}
              >
                <div className="md:col-span-3">
                  <TextInput
                    label="Image URL"
                    name="image_url"
                    value={imageForm.image_url}
                    onChange={handleImageFormChange}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <TextInput
                    label="Sort Order"
                    name="sort_order"
                    type="number"
                    value={imageForm.sort_order}
                    onChange={handleImageFormChange}
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 md:justify-end">
                  {imageForm.business_images_id && (
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-3 py-1 text-[11px]"
                      onClick={cancelEditImage}
                    >
                      Cancel
                    </button>
                  )}
                  <Button type="submit" loading={savingImage}>
                    {imageForm.business_images_id ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
            </div> */}

            <div className="border-t pt-3">
  <div className="text-[11px] font-semibold text-slate-600 mb-2">
    {imageForm.business_images_id ? "Edit Image" : "Add New Image"}
  </div>

  <form
    className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
    onSubmit={submitImageForm}
  >
    <div className="md:col-span-3 space-y-1">
      <label className="block text-xs font-medium text-slate-700">
        Image File
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="w-full rounded-md border border-slate-300 px-3 py-1 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 bg-white"
      />
      {imageForm.business_images_id && (
        <p className="text-[11px] text-slate-500">
          Leave empty to keep existing image. Upload a new file to replace.
        </p>
      )}
    </div>
    <div>
      <TextInput
        label="Sort Order"
        name="sort_order"
        type="number"
        value={imageForm.sort_order}
        onChange={handleImageFormChange}
        placeholder="0"
      />
    </div>
    <div className="flex gap-2 md:justify-end">
      {imageForm.business_images_id && (
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1 text-[11px]"
          onClick={cancelEditImage}
        >
          Cancel
        </button>
      )}
      <Button type="submit" loading={savingImage}>
        {imageForm.business_images_id ? "Update" : "Add"}
      </Button>
    </div>
  </form>
</div>



          </div>
        </div>
      )}


      {/* Pagination footer */}
{totalPages > 1 && (
  <div className="mt-3 flex items-center justify-end gap-2 text-xs">
    <Button
      size="sm"
      onClick={() =>
        loadBusinesses(Math.max(1, (pagination.page || 1) - 1), search, typeFilter)
      }
      disabled={pagination.page <= 1}
    >
      Prev
    </Button>
    <span className="text-slate-600">
      Page {pagination.page} of {totalPages}
    </span>
    <Button
      size="sm"
      onClick={() =>
        loadBusinesses(
          Math.min(totalPages, (pagination.page || 1) + 1),
          search,
          typeFilter
        )
      }
      disabled={pagination.page >= totalPages}
    >
      Next
    </Button>
  </div>
)}


{/* Large image preview modal */}
{previewImageUrl && (
  <div
    className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
    onClick={() => setPreviewImageUrl(null)}
  >
    <div
      className="relative max-h-[90vh] max-w-3xl rounded-xl bg-black/90 p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-800 shadow hover:bg-white"
        onClick={() => setPreviewImageUrl(null)}
      >
        ✕ Close
      </button>
      <div className="max-h-[80vh] overflow-auto">
        <img
          //src={`http://localhost:1000${previewImageUrl}`}
          src={getFileUrl(previewImageUrl)}
          
          alt="Business preview"
          className="block max-h-[80vh] w-auto rounded-md object-contain"
        />
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default BusinessListPage;
