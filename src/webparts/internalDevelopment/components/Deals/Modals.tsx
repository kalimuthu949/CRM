/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable eqeqeq */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-lone-blocks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Dialog } from "primereact/dialog";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import {
  PrimaryButton,
  Modal,
  IModalStyles,
  Icon,
  ITextFieldStyles,
  TextField,
} from "@fluentui/react";
import { Button } from "primereact/button";
import styles from "./Deals.module.scss";
import {
  IAllChoiceColumn,
  IChoice,
  IManagerChoices,
} from "../Redux/ConfigPageInterfaces";

// Interfaces
interface ILostOnDropData {
  ItemID: string;
  Stage: string;
  Index: number | null;
}
interface ILostModal {
  isOpen: boolean;
  onDropData: ILostOnDropData;
}
interface ISelectedValue {
  Lost: string | IChoice;
  Pipeline: IChoice;
  manager: IManagerChoices;
}
interface ILostChoice {
  isLostModal: {
    isOpen: boolean;
    onDropData: {
      Index: number | null;
      ItemID: string;
      Stage: string;
    };
  };
  setIsLostModal: (value: ILostModal) => void;
  allChoices: IAllChoiceColumn;
  currentDisplayName: string;
  currentEmail: string;
  setSelectedValue: (value: ISelectedValue) => void;
  selectedValue: ISelectedValue;
  onDrop: (
    itemId: string,
    stage: string,
    index: number | null,
    isLost?: boolean
  ) => void;
}
interface IManagersAnalysisOnDropData {
  ItemID: string;
  IfNeeded: boolean;
  Stage: string;
  Index: number | null;
}
interface IManagersAnalysisModal {
  isOpen: boolean;
  onDropData: IManagersAnalysisOnDropData;
}
interface IManagerAnalysis {
  isManagersAnalysisModal: IManagersAnalysisModal;
  setIsManagersAnalysisModal: (value: IManagersAnalysisModal) => void;
  onDrop: (
    itemId: string,
    stage: string,
    index: number | null,
    isLost?: boolean
  ) => void;
}
interface IChoiceListPipeline {
  label: string;
  value: number | any;
}
interface IPipeLineChoiceModal {
  isOpen: boolean;
  pipeLineValue: string;
  Stages: IChoiceListPipeline[];
}
interface IAddPipeLine {
  pipeLineChoiceAdd: IPipeLineChoiceModal;
  setPipeLineChoiceAdd: React.Dispatch<
    React.SetStateAction<IPipeLineChoiceModal>
  >;
  errorMessage: string;
  setErrorMessage: (value: string) => void;
  configAllChoices: IAllChoiceColumn;
  setLoader: (value: boolean) => void;
  AddPipeLineData: () => Promise<void>;
}

// Styles
const delModalStyle: Partial<IModalStyles> = {
  main: {
    minHeight: "130px",
    width: "25%",
    padding: "20px",
  },
};
const lModalStyle: Partial<IModalStyles> = {
  main: {
    minHeight: "150px",
    width: "25%",
    padding: "20px",
    borderRadius: "6px",
  },
};
const TextFieldsPipeLineChoiceStyles: Partial<ITextFieldStyles> = {
  root: {
    ".ms-TextField-wrapper": {
      ".ms-TextField-fieldGroup": {
        borderColor: "#00A99D !important",
        border: "1px solid #00A99D",
        borderRadius: "6px !important",
        height: "32px",
        minHeight: "30px",
        "::after": {
          border: "none !important",
        },
      },
    },
    label: {
      color: "#000 !important",
    },
    input: {
      color: "#000",
      fontWeight: "400",
      borderRadius: "6px",
    },
    i: {
      color: "#00A99D !important",
    },
  },
};
const TextFieldsPipeLineChoiceRequiredStyles: Partial<ITextFieldStyles> = {
  root: {
    ".ms-TextField-wrapper": {
      ".ms-TextField-fieldGroup": {
        borderColor: "#ff0000 !important",
        border: "2px solid #00A99D",
        borderRadius: "6px !important",
        height: "32px",
        minHeight: "30px",
        "::after": {
          border: "none !important",
        },
      },
    },
    label: {
      color: "#000 !important",
    },
    input: {
      color: "#000",
      fontWeight: "400",
      borderRadius: "6px",
    },
    i: {
      color: "#00A99D !important",
    },
  },
};

// Lost Modal
export const LostChoiceReason = ({
  isLostModal,
  setIsLostModal,
  allChoices,
  currentDisplayName,
  currentEmail,
  selectedValue,
  setSelectedValue,
  onDrop,
}: ILostChoice) => {
  const handleClose = () => {
    setIsLostModal({
      isOpen: false,
      onDropData: { Index: null, ItemID: "", Stage: "" },
    });
    setSelectedValue({
      Lost: "",
      Pipeline: { name: "Default", code: "Default" },
      manager: {
        name: currentDisplayName,
        code: currentDisplayName,
        eMail: currentEmail,
      },
    });
  };

  const handleAdd = () => {
    if (!selectedValue.Lost) return;
    onDrop(
      isLostModal.onDropData.ItemID,
      isLostModal.onDropData.Stage,
      isLostModal.onDropData.Index,
      false
    );
    handleClose();
  };

  return (
    <Dialog
      header="Lost choice reason"
      visible={isLostModal.isOpen}
      style={{ width: "28%" }}
      onHide={handleClose}
      draggable={false}
    >
      <div className={styles.lostModal}>
        <div className={`drpDown ${styles.lostModalDropDown}`}>
          <Dropdown
            value={selectedValue.Lost}
            onChange={(e: DropdownChangeEvent) =>
              setSelectedValue({ ...selectedValue, Lost: e.value })
            }
            options={allChoices.Lost}
            optionLabel="name"
            placeholder="Select a loss reason"
            style={{ width: 200 }}
          />
          <div className={styles.lostBtns}>
            <div className={styles.addCancelBtns}>
              <PrimaryButton
                className={styles.cancelBtn}
                text="Cancel"
                onClick={handleClose}
              />
              <PrimaryButton
                text="Add"
                style={{
                  cursor: selectedValue.Lost ? "pointer" : "not-allowed",
                }}
                onClick={handleAdd}
                disabled={!selectedValue.Lost}
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

// Managers Analysis Modal
export const ManagersAnalysis = ({
  isManagersAnalysisModal,
  setIsManagersAnalysisModal,
  onDrop,
}: IManagerAnalysis) => {
  return (
    <Modal isOpen={isManagersAnalysisModal.isOpen} styles={delModalStyle}>
      <p className={styles.delmsg}>Chandru's intervention needed</p>
      <div className={styles.modalBtnSec}>
        <PrimaryButton
          text="No"
          className={styles.cancelBtn}
          onClick={() => {
            setIsManagersAnalysisModal({
              isOpen: false,
              onDropData: {
                ...isManagersAnalysisModal.onDropData,
                IfNeeded: false,
              },
            });
            onDrop(
              isManagersAnalysisModal.onDropData.ItemID,
              isManagersAnalysisModal.onDropData.Stage,
              isManagersAnalysisModal.onDropData.Index,
              false
            );
          }}
        />
        <PrimaryButton
          text="Yes"
          className={styles.addBtn}
          onClick={() => {
            setIsManagersAnalysisModal({
              isOpen: false,
              onDropData: {
                ...isManagersAnalysisModal.onDropData,
                IfNeeded: true,
              },
            });
            onDrop(
              isManagersAnalysisModal.onDropData.ItemID,
              isManagersAnalysisModal.onDropData.Stage,
              isManagersAnalysisModal.onDropData.Index,
              true
            );
          }}
        />
      </div>
    </Modal>
  );
};

// Add Pipe line
export const AddPipeLine = ({
  pipeLineChoiceAdd,
  setPipeLineChoiceAdd,
  errorMessage,
  setErrorMessage,
  configAllChoices,
  setLoader,
  AddPipeLineData,
}: IAddPipeLine) => {
  return (
    <Modal isOpen={pipeLineChoiceAdd.isOpen} styles={lModalStyle}>
      <div className={styles.statusModal}>
        <div className={styles.statusModalHead}>
          <h2>Add Pipeline</h2>
          <Icon
            iconName="cancel"
            onClick={() => {
              setPipeLineChoiceAdd({
                isOpen: false,
                pipeLineValue: "",
                Stages: [
                  { label: "", value: "" },
                  { label: "", value: "" },
                ],
              });
              setErrorMessage("");
            }}
          />
        </div>
        <div className={styles.statusModalTextField}>
          <div>
            <TextField
              label="Pipeline"
              resizable={false}
              placeholder="Enter a Pipeline"
              className={styles.textField}
              styles={
                errorMessage == "Pipeline"
                  ? TextFieldsPipeLineChoiceRequiredStyles
                  : TextFieldsPipeLineChoiceStyles
              }
              value={pipeLineChoiceAdd.pipeLineValue}
              onChange={(
                event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
                newValue: string
              ) => {
                // OnChange("PipeLineChoice", newValue);
                setPipeLineChoiceAdd((pre) => ({
                  ...pre,
                  pipeLineValue: newValue,
                }));
              }}
            />
          </div>
          <div>
            <div className={`${styles.AddStages} AddStages stageBtnWidth`}>
              <label>Stages</label>
              <Button
                icon="pi pi-plus"
                rounded
                aria-label="Filter"
                className="stageButton"
                onClick={() => {
                  setPipeLineChoiceAdd((pre) => ({
                    ...pre,
                    Stages: [...pre.Stages, { label: "", value: "" }],
                  }));
                }}
              />
            </div>
            <div
              className={styles.AddStagesTextField}
              style={{
                paddingRight:
                  pipeLineChoiceAdd.Stages.length > 5 ? "10px" : "0px",
              }}
            >
              {pipeLineChoiceAdd.Stages.map((e, i) => (
                <div className={styles.stageTextFieldAndButton} key={i}>
                  <div style={{ width: "100%" }}>
                    <TextField
                      resizable={false}
                      placeholder={`Enter a Stage ${i + 1}`}
                      className={styles.textField}
                      styles={
                        errorMessage == `Stage ${i}`
                          ? TextFieldsPipeLineChoiceRequiredStyles
                          : TextFieldsPipeLineChoiceStyles
                      }
                      value={e.label}
                      onChange={(
                        event: React.FormEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >,
                        newValue: string
                      ) => {
                        // Update the specific stage at index i
                        setPipeLineChoiceAdd((pre) => ({
                          ...pre,
                          Stages: pre.Stages.map((stage, index) =>
                            index === i
                              ? {
                                  ...stage,
                                  label: newValue,
                                  value: pre.pipeLineValue,
                                }
                              : stage
                          ),
                        }));
                      }}
                    />
                  </div>
                  {pipeLineChoiceAdd.Stages.length > 2 && (
                    <div
                      className={`${styles.stagesRemoveButton} stageBtnWidth`}
                    >
                      {/* Remove the stage */}
                      <Button
                        icon="pi pi-times"
                        rounded
                        severity="danger"
                        aria-label="Cancel"
                        className="stageButton"
                        onClick={() => {
                          setPipeLineChoiceAdd((pre) => ({
                            ...pre,
                            Stages: pre.Stages.filter(
                              (_, index) => index !== i
                            ),
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.statusBtns}>
            <div className={styles.addCancelBtns}>
              <PrimaryButton
                className={styles.cancelBtn}
                text="Cancel"
                onClick={() => {
                  setPipeLineChoiceAdd({
                    isOpen: false,
                    pipeLineValue: "",
                    Stages: [
                      { label: "", value: "" },
                      { label: "", value: "" },
                    ],
                  });
                  setErrorMessage("");
                }}
              />
              <PrimaryButton
                text="Submit"
                style={{
                  cursor: pipeLineChoiceAdd.pipeLineValue.trim()
                    ? "pointer"
                    : "not-allowed",
                }}
                onClick={() => {
                  if (pipeLineChoiceAdd.pipeLineValue.trim() !== "") {
                    const labels = pipeLineChoiceAdd.Stages.map((stage) =>
                      stage.label.trim()
                    );

                    // Check for empty labels
                    const emptyStageIndex = labels.findIndex(
                      (label) => label === ""
                    );

                    // Check for duplicate labels
                    const duplicateStageIndex = labels.findIndex(
                      (label, index) => labels.indexOf(label) !== index
                    );

                    if (emptyStageIndex !== -1 || duplicateStageIndex !== -1) {
                      setErrorMessage(
                        `Stage ${
                          emptyStageIndex == -1
                            ? duplicateStageIndex
                            : emptyStageIndex
                        }`
                      );
                    } else if (
                      configAllChoices.PipeLine.some(
                        (e) =>
                          e.name.toLowerCase() ==
                          pipeLineChoiceAdd.pipeLineValue.toLowerCase()
                      )
                    ) {
                      setErrorMessage("Pipeline");
                    } else {
                      setLoader(true);
                      AddPipeLineData();
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
