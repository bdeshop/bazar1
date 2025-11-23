const express = require("express");
const router = express.Router();
const GameCategory = require("../models/GameCategory"); // Adjust path as needed
const GameProvider = require("../models/GameProvider"); // Adjust path as needed
const Game = require("../models/Game"); // Import the Game model
const Banner = require("../models/Banner"); // Import the Banner model
const Promotional = require("../models/Promotional");
const Withdrawmethod = require("../models/Withdrawmethod"); // Adjust path as needed
// GET all active banners
router.get("/banners", async (req, res) => {
  try {
    const banners = await Banner.find({ status: true })
      .sort({ createdAt: -1 })
      .select("name image createdAt");
    
    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching banners",
      error: error.message
    });
  }
});

// GET all categories with status true, sorted by order
router.get("/categories", async (req, res) => {
  try {
    const categories = await GameCategory.find({ status: true })
      .sort({ order: 1, createdAt: -1 })
      .select("name image order");
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message
    });
  }
});

// GET providers by category name
router.get("/providers/:category", async (req, res) => {
  try {
    const { category } = req.params;
    console.log(category)
    const providers = await GameProvider.find({ 
      category: category,
      status: true 
    })
    .sort({ order: 1, createdAt: -1 })
    .select("name image website order");
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching providers",
      error: error.message
    });
  }
});

// GET all providers (optional)
router.get("/providers", async (req, res) => {
  try {
    const providers = await GameProvider.find({ status: true })
      .sort({ order: 1, createdAt: -1 })
      .select("name image website category order");
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching all providers",
      error: error.message
    });
  }
});

// GET games with filtering and pagination
router.get("/games", async (req, res) => {
  try {
    const {
      category,
      provider,
      featured,
      search,
      page = 1,
      limit = 20,
      sortBy = "order",
      sortOrder = "asc"
    } = req.query;

    // Build filter object
    const filter = { status: true };
    
    if (category) filter.category = category;
    if (provider) filter.provider = provider;
    if (featured !== undefined) filter.featured = featured === 'true';
    
    // Search functionality (case-insensitive)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { gameId: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const games = await Game.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("name gameId provider category portraitImage landscapeImage featured order");

    // Get total count for pagination info
    const total = await Game.countDocuments(filter);

    res.json({
      success: true,
      data: games,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalGames: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching games",
      error: error.message
    });
  }
});
router.get("/all-games", async (req, res) => {
  try {
    // Execute query with pagination
    const games = await Game.find({})
      .sort({createdAt:-1})
    res.json({
      success: true,
      data: games,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Error fetching games",
      error: error.message
    });
  }
});
// GET single game by gameId
router.get("/games/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const game = await Game.findOne({ 
      gameId: gameId,
      status: true 
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found"
      });
    }

    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching game",
      error: error.message
    });
  }
});

// GET games by provider
router.get("/games/provider/:provider", async (req, res) => {
  try {
    const { provider } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const games = await Game.find({ 
      provider: provider,
      status: true 
    })
    .sort({ order: 1, name: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("name gameId portraitImage landscapeImage featured order");

    const total = await Game.countDocuments({ 
      provider: provider,
      status: true 
    });

    res.json({
      success: true,
      data: games,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalGames: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching games by provider",
      error: error.message
    });
  }
});

// GET games by category
router.get("/games/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const games = await Game.find({ 
      category: category,
      status: true 
    })
    .sort({ order: 1, name: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("name gameId provider portraitImage landscapeImage featured order");

    const total = await Game.countDocuments({ 
      category: category,
      status: true 
    });

    res.json({
      success: true,
      data: games,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalGames: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching games by category",
      error: error.message
    });
  }
});

// GET featured games
router.get("/games/featured/featured", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const games = await Game.find({ 
      featured: true,
      status: true 
    })
    .sort({ order: 1, createdAt: -1 })
    .limit(parseInt(limit))
    .select("name gameId provider category portraitImage landscapeImage order");

    res.json({
      success: true,
      data: games
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching featured games",
      error: error.message
    });
  }
});

// ----------------all-promotionals--------------------------
router.get("/promotions",async(req,res)=>{
  try {
    const promotions=await Promotional.find();
    if(!promotions){
      return res.send({success:false,message:"Promotions not found!"})
    }
    res.send({success:false,data:promotions})
  } catch (error) {
    console.log(error)
  }
})

const BettingHistory = require("../models/BettingHistory"); // Add this import at the top
const User = require("../models/User");
const Event = require("../models/Event");
const Branding = require("../models/Branding");
const Depositmethod = require("../models/Depositmethod");

// Add the callback route to your existing router
router.post("/callback", async (req, res) => {
  try {
    let { member_account, bet_amount, win_amount, game_uid, serial_number, currency_code, platform, game_type, device_info } = req.body;
    
    // Validate required fields
    if(!member_account || !game_uid || !serial_number || !currency_code ){
      return res.status(400).json({success: false, message: "Missing required fields"});
    }

    // Convert amounts to numbers
    bet_amount = parseFloat(bet_amount) || 0;
    win_amount = parseFloat(win_amount) || 0;

    // Check if this transaction already exists
    const existingBet = await BettingHistory.findOne({ serial_number });
    if (existingBet) {
      return res.status(409).json({
        success: false,
        message: "Duplicate transaction - this serial number already exists"
      });
    }

    const originalusername = member_account.substring(0, member_account.length - 2);
    
    // Find the user
    const matcheduser = await User.findOne({ player_id: originalusername });
    if (!matcheduser) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // Record balance before transaction
    const balanceBefore = matcheduser.balance;

    // Prepare the game history record for user model
    const gameRecord = {
      username: member_account,
      bet_amount: bet_amount,
      win_amount: win_amount,
      sports_id: game_uid,
      currency: currency_code || "BDT",
      status: win_amount > 0 ? "won" : "lost",
      playedAt: new Date()
    };

    // Update user balance
    matcheduser.balance -= bet_amount;
    if(win_amount > 0) {
      matcheduser.balance += win_amount;
    }

    // Update user statistics
    matcheduser.total_bet += bet_amount;
    if (win_amount > 0) {
      matcheduser.total_wins += win_amount;
      matcheduser.net_profit += (win_amount - bet_amount);
    } else {
      matcheduser.total_loss += bet_amount;
      matcheduser.net_profit -= bet_amount;
    }

    // Create betting history record
    const bettingRecord = new BettingHistory({
      member_account,
      original_username: originalusername,
      user_id: matcheduser._id,
      bet_amount,
      win_amount,
      net_amount: win_amount - bet_amount,
      game_uid,
      serial_number,
      currency_code,
      status: win_amount > 0 ? 'won' : 'lost',
      balance_before: balanceBefore,
      balance_after: matcheduser.balance,
      platform: platform || 'casino',
      game_type: game_type || '',
      device_info: device_info || ''
    });

    // Apply bet to wagering requirements if user has active bonuses
    if (matcheduser.bonusInfo.activeBonuses.length > 0) {
      await matcheduser.applyBetToWagering(bet_amount);
    }

    // Save all changes in a transaction
    await Promise.all([
      matcheduser.save(),
      bettingRecord.save()
    ]);

    // Add game history to user
    const updatedUser = await User.findByIdAndUpdate(
      { _id: matcheduser._id },
      { 
        $push: { gameHistory: gameRecord }
      },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        username: originalusername,
        balance: updatedUser.balance,
        win_amount,
        bet_amount,
        game_uid,
        transaction_id: bettingRecord._id,
        net_amount: win_amount - bet_amount
      },
      message: "Balance updated and game history recorded successfully"
    });

  } catch (error) {
    console.error("Error in callback:", error);
    res.status(500).json({
      success: false,
      message: "Server error processing callback",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ------------------------------all-event-------------------------
router.get("/events",async(req,res)=>{
 try {
   const events=await Event.find({});
   if(!events){
     return res.send({success:false,message:"Event not find!"})
   }
   res.send({success:true,data:events})
 } catch (error) {
  console.log(error)
 }
})
// ----------------------branding-data-----------------------
// GET current branding data
router.get("/branding", async (req, res) => {
  try {
    const branding = await Branding.getCurrentBranding();
    
    if (!branding) {
      return res.status(404).json({
        success: false,
        message: "Branding data not found"
      });
    }

    res.json({
      success: true,
      data: {
        logo: branding.logo,
        favicon: branding.favicon,
        lastUpdated: branding.lastUpdated,
        updatedBy: branding.updatedBy
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching branding data",
      error: error.message
    });
  }
});

// -----------------deposit-method-------------------------

router.get("/deposit-methods",async(req,res)=>{
  try {
    const depositmethods=await Depositmethod.find({enabled:true}) ;
    if(!depositmethods){
           return res.send({success:true,message:"No Deposit Method Found!"})
    }
    res.send({success:true,method:depositmethods})
  } catch (error) {
    console.log(error);
  }
})
// -----------------withdraw-method-------------------------

router.get("/withdraw-methods",async(req,res)=>{
  try {
    const withdrawmethods=await Withdrawmethod.find({enabled:true}) ;
    if(!withdrawmethods){
           return res.send({success:true,message:"No Deposit Method Found!"})
    }
    res.send({success:true,method:withdrawmethods})
  } catch (error) {
    console.log(error);
  }
})
const SocialLink = require("../models/SocialLink"); // Add this import

// ... (keep all your existing routes exactly as they are)

// ==================== SOCIAL LINK PUBLIC ROUTES ====================

// GET all active social links for frontend
router.get("/social-links", async (req, res) => {
  try {
    const socialLinks = await SocialLink.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('platform url displayName backgroundColor opensInNewTab');

    // Format URLs for frontend and add additional properties
    const formattedLinks = socialLinks.map(link => ({
      platform: link.platform,
      url: link.url.startsWith('http') ? link.url : `https://${link.url}`,
      displayName: link.displayName,
      backgroundColor: link.backgroundColor,
      opensInNewTab: link.opensInNewTab,
      isGradient: link.backgroundColor.includes('gradient'),
      icon: getPlatformIcon(link.platform)
    }));

    res.json({
      success: true,
      data: formattedLinks,
      count: formattedLinks.length
    });
  } catch (error) {
    console.error("Error fetching social links:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching social links",
      error: error.message
    });
  }
});

// GET social links by platform
router.get("/social-links/:platform", async (req, res) => {
  try {
    const { platform } = req.params;
    
    const socialLink = await SocialLink.findOne({ 
      platform: platform,
      isActive: true 
    }).select('platform url displayName backgroundColor opensInNewTab');

    if (!socialLink) {
      return res.status(404).json({
        success: false,
        message: "Social link not found for this platform"
      });
    }

    // Format the response
    const formattedLink = {
      platform: socialLink.platform,
      url: socialLink.url.startsWith('http') ? socialLink.url : `https://${socialLink.url}`,
      displayName: socialLink.displayName,
      backgroundColor: socialLink.backgroundColor,
      opensInNewTab: socialLink.opensInNewTab,
      isGradient: socialLink.backgroundColor.includes('gradient'),
      icon: getPlatformIcon(socialLink.platform)
    };

    res.json({
      success: true,
      data: formattedLink
    });
  } catch (error) {
    console.error("Error fetching social link:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching social link",
      error: error.message
    });
  }
});

// GET social links statistics (for admin dashboard or analytics)
router.get("/social-links/stats/overview", async (req, res) => {
  try {
    const totalLinks = await SocialLink.countDocuments();
    const activeLinks = await SocialLink.countDocuments({ isActive: true });
    const inactiveLinks = await SocialLink.countDocuments({ isActive: false });

    // Get platform distribution
    const platformStats = await SocialLink.aggregate([
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalLinks,
        active: activeLinks,
        inactive: inactiveLinks,
        platformDistribution: platformStats
      }
    });
  } catch (error) {
    console.error("Error fetching social links stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching social links statistics",
      error: error.message
    });
  }
});

// Helper function to get platform icons
function getPlatformIcon(platform) {
  const icons = {
    facebook: "FaFacebook",
    instagram: "FaInstagram", 
    twitter: "FaTwitter",
    youtube: "FaYoutube",
    pinterest: "FaPinterest",
    tiktok: "SiTiktok",
    telegram: "SiTelegram",
    whatsapp: "FaWhatsapp",
    linkedin: "FaLinkedin",
    discord: "FaDiscord",
    reddit: "FaReddit",
    medium: "FaMedium",
    github: "FaGithub",
    snapchat: "FaSnapchat",
    viber: "FaComment",
    wechat: "FaWeixin",
    line: "FaComment",
    skype: "FaSkype"
  };
  
  return icons[platform] || "FaShare";
}
module.exports = router;