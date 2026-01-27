import { Schema, model } from "mongoose";
import { ISupport } from '../interfaces/model.interface';
import { 
  SupportAssignee, 
  SupportStatus, 
  allowedSupportCategories, 
  allowedSupportAssignees, 
  allowedSupportStatuses 
} from '../constants/support.constants';
import { allowedDepartments, allowedPriorities } from '../constants/common.constants';

export const supportSchema = new Schema<ISupport>(
  {
    ticketTitle: { 
      type: String, 
      required: [true, 'Ticket title is required'],
      trim: true,
      maxlength: [200, 'Ticket title cannot exceed 200 characters']
    },
    category: {
      type: String,
      enum: {
        values: allowedSupportCategories,
        message: '{VALUE} is not a valid category'
      },
      required: [true, 'Category is required']
    },
    priority: {
      type: String,
      enum: {
        values: allowedPriorities,
        message: '{VALUE} is not a valid priority'
      },
      required: [true, 'Priority is required']
    },
    department: {
      type: String,
      enum: {
        values: allowedDepartments,
        message: '{VALUE} is not a valid department'
      },
      required: [true, 'Department is required']
    },
    assignTo: {
      type: String,
      enum: {
        values: allowedSupportAssignees,
        message: '{VALUE} is not a valid assignee'
      },
      required: [true, 'Assignee is required'],
      default: SupportAssignee.UNASSIGNED
    },
    description: { 
      type: String, 
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    submittedBy: { 
      type: String, 
      required: [true, 'Submitted by is required'],
      trim: true,
      maxlength: [200, 'Submitted by cannot exceed 200 characters']
    },
    status: {
      type: String,
      enum: {
        values: allowedSupportStatuses,
        message: '{VALUE} is not a valid status'
      },
      default: SupportStatus.OPEN,
      required: [true, 'Status is required']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better query performance
supportSchema.index({ ticketTitle: 1 }, { name: 'idx_support_title' });
supportSchema.index({ submittedBy: 1 }, { name: 'idx_support_submitted_by' });
supportSchema.index({ createdAt: -1 }, { name: 'idx_support_created_desc' });














// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
