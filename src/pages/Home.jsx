import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getAllJobs,
  selectJobs,
  selectJobLoading,
  selectJobError,
} from "../store/jobSlice";

function Home() {
  const dispatch = useDispatch();

  const jobs = useSelector(selectJobs);
  const loading = useSelector(selectJobLoading);
  const error = useSelector(selectJobError);

  useEffect(() => {
    dispatch(getAllJobs());
  }, [dispatch]);

  return (
    <div>
      <h1>Find Your Dream Job</h1>

      <p>Find the right job opportunity for your career.</p>

      {loading && <p>Loading jobs...</p>}

      {error && <p>Error: {error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <p>No jobs available.</p>
      )}

      {!loading && jobs.length > 0 && (
        <div>
          {jobs.map((job) => (
            <div key={job._id}>
              <h2>{job.title}</h2>

              <p>
                <strong>Company:</strong>{" "}
                {job.company}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {job.location}
              </p>

              <p>
                <strong>Job Type:</strong>{" "}
                {job.jobType}
              </p>

              <p>
                <strong>Salary:</strong>{" "}
                {job.salary || "Not specified"}
              </p>

              <p>{job.description}</p>

              {job.skills?.length > 0 && (
                <p>
                  <strong>Skills:</strong>{" "}
                  {job.skills.join(", ")}
                </p>
              )}

              <button>View Job</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;