import React, { useState, useEffect } from "react";
import { FaUpload, FaTimes, FaSpinner } from "react-icons/fa";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { toast } from "react-toastify";

const Newgames = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const premium_api_key = import.meta.env.VITE_PREMIUM_API_KEY;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [games, setGames] = useState([]);

  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);
  const [savingGameId, setSavingGameId] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchAndMergeProviders = async () => {
      setLoadingProviders(true);
      try {
        const [localRes, externalRes] = await Promise.all([
          fetch(`${base_url}/api/admin/game-providers`),
          fetch(`https://apigames.oracleapi.net/api/providers`, {
            headers: { "x-api-key": premium_api_key },
          }),
        ]);

        if (!localRes.ok || !externalRes.ok) {
          toast.error("Failed to fetch providers from all sources.");
          return;
        }

        const localProviders = await localRes.json();
        const externalProviders = await externalRes.json();

        const localProviderIds = new Set(
          localProviders.map((p) => p.providerOracleID)
        );

        const mergedProviders = externalProviders.data.filter((p) =>
          localProviderIds.has(p._id)
        );

        setProviders(mergedProviders);
      } catch (error) {
        console.error("Error fetching and merging providers:", error);
        toast.error("An error occurred while fetching providers.");
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchAndMergeProviders();
  }, []);

  useEffect(() => {
    if (!selectedProvider) {
      setGames([]);
      return;
    }

    const fetchAndMergeGames = async () => {
      setLoadingGames(true);
      try {
        const [externalGamesRes, localGamesRes] = await Promise.all([
          fetch(
            `https://apigames.oracleapi.net/api/games/pagination?limit=2000&provider=${selectedProvider}`,
            { headers: { "x-api-key": premium_api_key } }
          ),
          fetch(`${base_url}/api/admin/games/all`),
        ]);

        if (!externalGamesRes.ok || !localGamesRes.ok) {
          toast.error("Failed to fetch games from all sources.");
          return;
        }

        const externalGamesData = await externalGamesRes.json();
        const localGames = await localGamesRes.json();

        const localGamesMap = new Map(
          localGames.map((game) => [game.gameApiID, game])
        );

        const mergedGames = externalGamesData.data.map((externalGame) => {
          const localGame = localGamesMap.get(externalGame._id);
          if (localGame) {
            return {
              ...externalGame,
              isSaved: true,
              localId: localGame._id,
              localFeatured: localGame.featured,
              localStatus: localGame.status,
              localPortraitPreview: `${base_url}${localGame.portraitImage}`,
              localLandscapePreview: `${base_url}${localGame.landscapeImage}`,
              localPortraitImage: null, // Not holding the file object unless changed
              localLandscapeImage: null,
            };
          } else {
            return {
              ...externalGame,
              isSaved: false,
              localFeatured: false,
              localStatus: true,
              localPortraitImage: null,
              localLandscapeImage: null,
              localPortraitPreview: null,
              localLandscapePreview: null,
            };
          }
        });

        setGames(mergedGames);
      } catch (error) {
        console.error("Error fetching and merging games:", error);
        toast.error("An error occurred while fetching games.");
      } finally {
        setLoadingGames(false);
      }
    };

    fetchAndMergeGames();
  }, [selectedProvider]);

  const handleGameDataChange = (gameApiID, field, value) => {
    setGames((prevGames) =>
      prevGames.map((game) =>
        game._id === gameApiID ? { ...game, [field]: value } : game
      )
    );
  };

  const handleImageUpload = (gameApiID, type, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setGames((prevGames) =>
        prevGames.map((game) => {
          if (game._id === gameApiID) {
            if (type === "portrait") {
              return {
                ...game,
                localPortraitImage: file,
                localPortraitPreview: reader.result,
              };
            } else {
              return {
                ...game,
                localLandscapeImage: file,
                localLandscapePreview: reader.result,
              };
            }
          }
          return game;
        })
      );
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (gameApiID, type) => {
    setGames((prevGames) =>
      prevGames.map((game) => {
        if (game._id === gameApiID) {
          if (type === "portrait") {
            return {
              ...game,
              localPortraitImage: null,
              localPortraitPreview: null,
            };
          } else {
            return {
              ...game,
              localLandscapeImage: null,
              localLandscapePreview: null,
            };
          }
        }
        return game;
      })
    );
  };

  const handleSaveOrUpdateGame = async (gameApiID) => {
    const gameToSave = games.find((g) => g._id === gameApiID);

    if (
      !gameToSave.isSaved &&
      (!gameToSave.localPortraitImage || !gameToSave.localLandscapeImage)
    ) {
      toast.error(
        "Please upload both portrait and landscape images for a new game."
      );
      return;
    }

    setSavingGameId(gameApiID);

    try {
      const formData = new FormData();
      formData.append("gameApiID", gameToSave._id);
      formData.append("name", gameToSave.name);
      formData.append("provider", gameToSave.provider.name);
      formData.append("category", gameToSave.category.name);
      formData.append("featured", gameToSave.localFeatured);
      formData.append("status", gameToSave.localStatus);
      if (gameToSave.localPortraitImage) {
        formData.append("portraitImage", gameToSave.localPortraitImage);
      }
      if (gameToSave.localLandscapeImage) {
        formData.append("landscapeImage", gameToSave.localLandscapeImage);
      }

      const isUpdate = gameToSave.isSaved;
      const url = isUpdate
        ? `${base_url}/api/admin/games/${gameToSave.localId}`
        : `${base_url}/api/admin/games`;
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Game "${gameToSave.name}" ${
            isUpdate ? "updated" : "added"
          } successfully!`
        );
        setGames((prevGames) =>
          prevGames.map((g) =>
            g._id === gameApiID
              ? {
                  ...g,
                  isSaved: true,
                  localId: result.game._id,
                  localPortraitImage: null, // Clear file object
                  localLandscapeImage: null,
                }
              : g
          )
        );
      } else {
        toast.error(
          result.error ||
            `Failed to ${isUpdate ? "update" : "add"} game "${
              gameToSave.name
            }".`
        );
      }
    } catch (error) {
      console.error("Error saving game:", error);
      toast.error("An error occurred while saving the game.");
    } finally {
      setSavingGameId(null);
    }
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />
        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? "md:ml-[40%] lg:ml-[28%] xl:ml-[17%]" : "ml-0"
          }`}
        >
          <div className="w-full mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Add New Games from Provider
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6 border border-orange-100">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Game Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                  disabled={loadingProviders}
                >
                  <option value="">
                    {loadingProviders
                      ? "Loading providers..."
                      : "Select a provider"}
                  </option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider._id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingGames && (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-orange-500 text-4xl" />
              </div>
            )}

            {!loadingGames && games.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <div
                    key={game._id}
                    className={`bg-white rounded-lg shadow-md p-4 border flex flex-col ${
                      game.isSaved ? "border-green-400" : "border-gray-200"
                    }`}
                  >
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                      {game.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Provider: {game.provider.name}
                    </p>

                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-40 object-contain rounded-md mb-4 bg-gray-100"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <input
                          id={`featured-${game._id}`}
                          type="checkbox"
                          checked={game.localFeatured}
                          onChange={(e) =>
                            handleGameDataChange(
                              game._id,
                              "localFeatured",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`featured-${game._id}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Featured
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id={`status-${game._id}`}
                          type="checkbox"
                          checked={game.localStatus}
                          onChange={(e) =>
                            handleGameDataChange(
                              game._id,
                              "localStatus",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`status-${game._id}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Active
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Portrait Image */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Portrait *
                        </label>
                        {game.localPortraitPreview ? (
                          <div className="relative">
                            <img
                              src={game.localPortraitPreview}
                              alt="Portrait"
                              className="h-24 w-full object-contain border rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(game._id, "portrait")}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <label className="flex justify-center w-full h-24 px-2 border-2 border-dashed rounded-md cursor-pointer">
                            <span className="flex items-center space-x-2">
                              <FaUpload className="text-gray-400" />
                              <span className="font-medium text-gray-500 text-xs">
                                Upload
                              </span>
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(
                                  game._id,
                                  "portrait",
                                  e.target.files[0]
                                )
                              }
                            />
                          </label>
                        )}
                      </div>
                      {/* Landscape Image */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Landscape *
                        </label>
                        {game.localLandscapePreview ? (
                          <div className="relative">
                            <img
                              src={game.localLandscapePreview}
                              alt="Landscape"
                              className="h-24 w-full object-contain border rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(game._id, "landscape")}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <label className="flex justify-center w-full h-24 px-2 border-2 border-dashed rounded-md cursor-pointer">
                            <span className="flex items-center space-x-2">
                              <FaUpload className="text-gray-400" />
                              <span className="font-medium text-gray-500 text-xs">
                                Upload
                              </span>
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(
                                  game._id,
                                  "landscape",
                                  e.target.files[0]
                                )
                              }
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <button
                        type="button"
                        onClick={() => handleSaveOrUpdateGame(game._id)}
                        disabled={savingGameId === game._id}
                        className={`w-full px-4 py-2 text-white font-medium rounded-md focus:outline-none transition-colors disabled:opacity-70 flex items-center justify-center ${
                          game.isSaved
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-orange-500 hover:bg-orange-600"
                        }`}
                      >
                        {savingGameId === game._id ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Saving...
                          </>
                        ) : game.isSaved ? (
                          "Update Game"
                        ) : (
                          "Save Game"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingGames && selectedProvider && games.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No games found for the selected provider.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  );
};

export default Newgames;
