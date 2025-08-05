import * as React from "react";
import styles from "./Projects.module.scss";
import { useState } from "react";
import { PrimaryButton } from "office-ui-fabric-react";

interface IProjectFormProps {
  project?: any;
  Notify: (
    type: "info" | "success" | "warn" | "error" | "secondary" | "contrast",
    summary: string,
    msg: string
  ) => void;
  spfxContext: any;
  pageName: string;
  PageNavigation: (pageName: string) => void;
}

const initialForm = {
  ProjectID: "",
  LeadID: "",
  AccountName: "",
  ProjectName: "",
  StartDate: "",
  PlannedEndDate: "",
  ProjectManager: "",
  ProjectStatus: "Initiated",
  BillingModel: "",
  BillingContactName: "",
  BillingContactEmail: "",
  BillingContactMobile: "",
  BillingAddress: "",
  Remarks: "",
};

const ProjectFormPage = (props: IProjectFormProps) => {
  const [form, setForm] = useState(props.project || initialForm);

  // Example: Auto-generate ProjectID if new
  React.useEffect(() => {
    if (!props.project) {
      setForm((prev: any) => ({
        ...prev,
        ProjectID: `PRJ-${new Date().getFullYear()}-${Math.floor(
          100 + Math.random() * 900
        )}`,
      }));
    }
  }, [props.project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ///props.onSave(form);
  };

  return (
    <form className={styles.projectForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <label>Project ID</label>
        <input name="ProjectID" value={form.ProjectID} readOnly />
      </div>
      <div className={styles.formRow}>
        <label>Lead ID</label>
        <input name="LeadID" value={form.LeadID} onChange={handleChange} required />
      </div>
      <div className={styles.formRow}>
        <label>Account Name</label>
        <input name="AccountName" value={form.AccountName} readOnly />
      </div>
      <div className={styles.formRow}>
        <label>Project Name</label>
        <input name="ProjectName" value={form.ProjectName} onChange={handleChange} required />
      </div>
      <div className={styles.formRow}>
        <label>Start Date</label>
        <input type="date" name="StartDate" value={form.StartDate} onChange={handleChange} required />
      </div>
      <div className={styles.formRow}>
        <label>Planned End Date</label>
        <input type="date" name="PlannedEndDate" value={form.PlannedEndDate} onChange={handleChange} required min={form.StartDate} />
      </div>
      <div className={styles.formRow}>
        <label>Project Manager</label>
        <input name="ProjectManager" value={form.ProjectManager} onChange={handleChange} required />
      </div>
      <div className={styles.formRow}>
        <label>Project Status</label>
        <select name="ProjectStatus" value={form.ProjectStatus} onChange={handleDropdown}>
          <option value="Initiated">Initiated</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div className={styles.formRow}>
        <label>Billing Model</label>
        <select name="BillingModel" value={form.BillingModel} onChange={handleDropdown} required>
          <option value="">Select</option>
          <option value="Milestone">Milestone</option>
          <option value="Fixed Monthly">Fixed Monthly</option>
          <option value="T&M">T&M</option>
          <option value="Resource-based">Resource-based</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>
      <div className={styles.formRow}>
        <label>Billing Contact Name</label>
        <input name="BillingContactName" value={form.BillingContactName} onChange={handleChange} required />
      </div>
      <div className={styles.formRow}>
        <label>Billing Contact Email</label>
        <input name="BillingContactEmail" value={form.BillingContactEmail} onChange={handleChange} required />
      </div>
      <div className={styles.formRow}>
        <label>Billing Contact Mobile</label>
        <input name="BillingContactMobile" value={form.BillingContactMobile} onChange={handleChange} />
      </div>
      <div className={styles.formRow}>
        <label>Billing Address</label>
        <textarea name="BillingAddress" value={form.BillingAddress} onChange={handleChange} maxLength={500} />
      </div>
      <div className={styles.formRow}>
        <label>Remarks</label>
        <textarea name="Remarks" value={form.Remarks} onChange={handleChange} maxLength={500} />
      </div>
      <div className={styles.formActions}>
        <PrimaryButton text="Save" type="submit" />
        {/* <PrimaryButton text="Cancel" onClick={props.onCancel} /> */}
      </div>
    </form>
  );
};

export default ProjectFormPage;