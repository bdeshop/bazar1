const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BettingHistorySchema = new Schema({
    member_account: {
        type: String,
        required: true,
        trim: true
    },
    original_username: {
        type: String,
        required: true,
        trim: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bet_amount: {
        type: Number,
        required: true,
        min: 0
    },
    win_amount: {
        type: Number,
        required: true,
        default: 0
    },
    net_amount: {
        type: Number,
        required: true
    },
    game_uid: {
        type: String,
        required: true
    },
    serial_number: {
        type: String,
        required: true,
        unique: true
    },
    currency_code: {
        type: String,
        required: true,
        default: 'BDT'
    },
    status: {
        type: String,
        enum: ['won', 'lost', 'pending', 'cancelled'],
        default: 'pending'
    },
    balance_before: {
        type: Number,
        required: true
    },
    balance_after: {
        type: Number,
        required: true
    },
    transaction_time: {
        type: Date,
        default: Date.now
    },
    processed_at: {
        type: Date,
        default: Date.now
    },
    platform: {
        type: String,
        default: 'casino'
    },
    game_type: {
        type: String
    },
    device_info: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for better query performance
BettingHistorySchema.index({ user_id: 1, transaction_time: -1 });
BettingHistorySchema.index({ member_account: 1, serial_number: 1 });
BettingHistorySchema.index({ serial_number: 1 }, { unique: true });
BettingHistorySchema.index({ transaction_time: -1 });
BettingHistorySchema.index({ status: 1, transaction_time: -1 });

// Virtual for calculating net result
BettingHistorySchema.virtual('net_result').get(function() {
    return this.win_amount - this.bet_amount;
});

// Pre-save middleware to calculate net amount
BettingHistorySchema.pre('save', function(next) {
    this.net_amount = this.win_amount - this.bet_amount;
    next();
});

// Static method to check if serial number exists
BettingHistorySchema.statics.serialNumberExists = async function(serialNumber) {
    const count = await this.countDocuments({ serial_number: serialNumber });
    return count > 0;
};

// Static method to get user betting summary
BettingHistorySchema.statics.getUserSummary = async function(userId) {
    return this.aggregate([
        { $match: { user_id: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$user_id',
                total_bets: { $sum: 1 },
                total_bet_amount: { $sum: '$bet_amount' },
                total_win_amount: { $sum: '$win_amount' },
                total_net_amount: { $sum: '$net_amount' },
                wins: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
                losses: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } }
            }
        }
    ]);
};

const BettingHistory = mongoose.model('BettingHistory', BettingHistorySchema);
module.exports = BettingHistory;