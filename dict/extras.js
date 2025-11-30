extras = [
    ["i", "me", "my", "mine"], 
    ["you", "your", "yours"], 
    ["he", "him", "his"],
    ["she", "her", "hers"],
    ["they", "them", "their", "theirs"],
    ["it", "its"],
    ["we", "us", "our", "ours"],
    ["be", "is", "was", "am", "are", "were", "been", "being"],
    ["a","an"]
]

//remove unbalenced words
ipaToOrth["ə"].splice(ipaToOrth["ə"].indexOf("are"),1)
orthToIpa["are"] = [["ɑː"]] //its easer this way