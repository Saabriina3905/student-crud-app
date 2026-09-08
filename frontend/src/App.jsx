import toast, { Toaster } from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
  });

  const [students, setStudents] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [deleteId, setDeleteId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const studentsPerPage = 5;

  // ================================
  // FETCH STUDENTS
  // ================================

  const fetchStudents = async (showPageLoader = false) => {
    try {
      if (showPageLoader) {
        setLoading(true);
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/students"
      );

      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      if (showPageLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchStudents(true);
  }, []);

  // ================================
  // FORM CHANGE
  // ================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================================
  // RESET FORM
  // ================================

  const resetForm = () => {
    setForm({
      full_name: "",
      email: "",
      phone: "",
      age: "",
    });

    setEditingId(null);
  };

  // ================================
  // OPEN ADD MODAL
  // ================================

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // ================================
  // CLOSE ADD / EDIT MODAL
  // ================================

  const closeModal = () => {
    if (actionLoading) return;

    resetForm();
    setShowModal(false);
  };

  // ================================
  // ADD / UPDATE STUDENT
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (actionLoading) return;

    try {
      setActionLoading(true);

      const data = {
        ...form,
        age: Number(form.age),
      };

      // UPDATE
      if (editingId) {
        await axios.put(
          `http://127.0.0.1:8000/students/${editingId}`,
          data
        );

        // refresh table
        await fetchStudents();

        // close modal directly
        setShowModal(false);

        // reset form
        resetForm();

        toast.success("Student updated successfully");
      }

      // ADD
      else {
        await axios.post(
          "http://127.0.0.1:8000/students",
          data
        );

        // refresh table
        await fetchStudents();

        // close modal directly
        setShowModal(false);

        // reset form
        resetForm();

        toast.success("Student added successfully");
      }
    } catch (error) {
      console.error("Submit error:", error);

      toast.error(
        editingId
          ? "Failed to update student"
          : "Failed to add student"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ================================
  // EDIT STUDENT
  // ================================

  const handleEdit = (student) => {
    setForm({
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || "",
      age: student.age || "",
    });

    setEditingId(student.id);
    setShowModal(true);
  };

  // ================================
  // OPEN DELETE MODAL
  // ================================

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  // ================================
  // CLOSE DELETE MODAL
  // ================================

  const closeDeleteModal = () => {
    if (actionLoading) return;

    setDeleteId(null);
  };

  // ================================
  // CONFIRM DELETE
  // ================================

  const confirmDelete = async () => {
    if (actionLoading) return;

    try {
      setActionLoading(true);

      await axios.delete(
        `http://127.0.0.1:8000/students/${deleteId}`
      );

      // refresh table first
      await fetchStudents();

      // close modal
      setDeleteId(null);

      toast.success("Student deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);

      toast.error("Failed to delete student");
    } finally {
      setActionLoading(false);
    }
  };

  // ================================
  // SEARCH
  // ================================

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return students;
    }

    return students.filter((student) => {
      const name =
        student.full_name?.toLowerCase() || "";

      const email =
        student.email?.toLowerCase() || "";

      const phone =
        student.phone?.toLowerCase() || "";

      const age =
        String(student.age ?? "");

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword) ||
        age.includes(keyword)
      );
    });
  }, [students, search]);

  // ================================
  // PAGINATION
  // ================================

  const totalPages = Math.ceil(
    filteredStudents.length / studentsPerPage
  );

  const indexOfLastStudent =
    currentPage * studentsPerPage;

  const indexOfFirstStudent =
    indexOfLastStudent - studentsPerPage;

  const currentStudents =
    filteredStudents.slice(
      indexOfFirstStudent,
      indexOfLastStudent
    );

  useEffect(() => {
    if (
      currentPage > totalPages &&
      totalPages > 0
    ) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // ================================
  // INITIAL PAGE LOADING
  // ================================

  if (loading) {
    return (
      <>
        <Toaster position="top-right" />

        <div className="page-loader">
          <div className="spinner"></div>

          <p>Loading students...</p>
        </div>
      </>
    );
  }

  // ================================
  // UI
  // ================================

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,

          style: {
            borderRadius: "12px",
            padding: "14px 16px",
          },
        }}
      />

      <div className="page">

        <div className="container">

          {/* HEADER */}

          <div className="header">

            <div>

              <p className="eyebrow">
                Student Management
              </p>

              <h1>
                Student Dashboard
              </h1>

              <p className="subtitle">
                Create, manage and update student records.
              </p>

            </div>

            <div className="header-actions">

              <div className="student-count">

                <span>
                  Total Students
                </span>

                <strong>
                  {students.length}
                </strong>

              </div>

              <button
                className="add-student-btn"
                onClick={openAddModal}
              >
                + Add Student
              </button>

            </div>

          </div>


          {/* TABLE CARD */}

          <div className="table-card">

            <div className="table-header">

              <div>

                <h2>
                  Students
                </h2>

                <p>
                  All registered students
                </p>

              </div>

              <div className="table-header-actions">

                <input
                  type="text"
                  className="search-input"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <button
                  className="add-student-btn"
                  onClick={openAddModal}
                >
                  + Add Student
                </button>

              </div>

            </div>


            {/* TABLE */}

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>

                </thead>


                <tbody>

                  {filteredStudents.length === 0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="empty-state"
                      >
                        No students found.
                      </td>

                    </tr>

                  ) : (

                    currentStudents.map(
                      (student) => (

                        <tr key={student.id}>

                          <td className="student-id">
                            #{student.id}
                          </td>


                          <td>

                            <div className="student-info">

                              <div className="avatar">

                                {student.full_name
                                  ?.charAt(0)
                                  .toUpperCase()}

                              </div>

                              <strong>
                                {student.full_name}
                              </strong>

                            </div>

                          </td>


                          <td>
                            {student.email}
                          </td>


                          <td>
                            {student.phone || "—"}
                          </td>


                          <td>

                            <span className="age-badge">
                              {student.age}
                            </span>

                          </td>


                          <td>

                            <div className="actions">

                              <button
                                className="edit-btn"
                                onClick={() =>
                                  handleEdit(student)
                                }
                              >
                                Edit
                              </button>


                              <button
                                className="delete-btn"
                                onClick={() =>
                                  handleDelete(
                                    student.id
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>


            {/* TABLE FOOTER */}

            <div className="table-footer">

              <div className="pagination-info">

                Showing{" "}

                {filteredStudents.length === 0
                  ? 0
                  : indexOfFirstStudent + 1}

                {" - "}

                {Math.min(
                  indexOfLastStudent,
                  filteredStudents.length
                )}

                {" of "}

                {filteredStudents.length}

              </div>


              {totalPages > 1 && (

                <div className="pagination">

                  <button
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          Math.max(
                            prev - 1,
                            1
                          )
                      )
                    }
                    disabled={
                      currentPage === 1
                    }
                  >
                    Previous
                  </button>


                  {Array.from(
                    {
                      length: totalPages,
                    },

                    (_, index) =>
                      index + 1

                  ).map((page) => (

                    <button
                      key={page}

                      className={
                        currentPage === page
                          ? "active-page"
                          : ""
                      }

                      onClick={() =>
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>

                  ))}


                  <button
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          Math.min(
                            prev + 1,
                            totalPages
                          )
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                  >
                    Next
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>


        {/* ================================
            ADD / EDIT MODAL
        ================================= */}

        {showModal && (

          <div className="modal-overlay">

            <div className="modal">

              <div className="modal-header">

                <div>

                  <h2>

                    {editingId
                      ? "Edit Student"
                      : "Add New Student"}

                  </h2>


                  <p>

                    {editingId
                      ? "Update the selected student's information."
                      : "Enter student information below."}

                  </p>

                </div>


                <button
                  className="close-btn"
                  onClick={closeModal}
                  type="button"
                  disabled={actionLoading}
                >
                  ×
                </button>

              </div>


              <form onSubmit={handleSubmit}>

                <div className="form-grid">


                  {/* FULL NAME */}

                  <div className="form-group">

                    <label>
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="full_name"
                      placeholder="Enter full name"
                      value={form.full_name}
                      onChange={handleChange}
                      disabled={actionLoading}
                      required
                    />

                  </div>


                  {/* EMAIL */}

                  <div className="form-group">

                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      placeholder="student@example.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={actionLoading}
                      required
                    />

                  </div>


                  {/* PHONE */}

                  <div className="form-group">

                    <label>
                      Phone Number
                    </label>

                    <input
                      type="text"
                      name="phone"
                      placeholder="0612345678"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={actionLoading}
                    />

                  </div>


                  {/* AGE */}

                  <div className="form-group">

                    <label>
                      Age
                    </label>

                    <input
                      type="number"
                      name="age"
                      placeholder="20"
                      value={form.age}
                      onChange={handleChange}
                      disabled={actionLoading}
                    />

                  </div>

                </div>


                {/* MODAL ACTIONS */}

                <div className="modal-actions">


                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={closeModal}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={actionLoading}
                  >

                    {actionLoading ? (

                      <>

                        <span className="button-spinner"></span>

                        {editingId
                          ? "Updating..."
                          : "Adding..."}

                      </>

                    ) : (

                      editingId
                        ? "Update Student"
                        : "Add Student"

                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}


        {/* ================================
            DELETE MODAL
        ================================= */}

        {deleteId !== null && (

          <div className="modal-overlay">

            <div className="delete-modal">

              <div className="delete-modal-icon">
                !
              </div>


              <h2>
                Delete Student?
              </h2>


              <p>
                Are you sure you want to delete
                this student? This action cannot
                be undone.
              </p>


              <div className="delete-modal-actions">


                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeDeleteModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>


                <button
                  type="button"
                  className="confirm-delete-btn"
                  onClick={confirmDelete}
                  disabled={actionLoading}
                >

                  {actionLoading ? (

                    <>

                      <span className="button-spinner"></span>

                      Deleting...

                    </>

                  ) : (

                    "Delete"

                  )}

                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </>
  );
}

export default App;