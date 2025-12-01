extras = [
    ["i", "me", "my", "mine"], 
    ["you", "your"], 
    ["he", "him", "his"],
    ["she", "her"],
    ["they", "them", "their"],
    ["it", "its"],
    ["we", "us", "our"],
    ["be", "is", "was", "am", "are", "were", "been", "being"],
    ["a","an"]
]

//remove unbalenced words
ipaToOrth["ə"].splice(ipaToOrth["ə"].indexOf("are"),1)
orthToIpa["are"] = [["ɑː"]] //its easer this way