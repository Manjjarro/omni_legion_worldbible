# 🕸️ EXPLICIT GRAPH INDEX

## 👥 Character Nodes & Associated Elements
* **[[CHAR_001]]** (Confidence: 0.9 | Stable)
	* Linked Prompts: [[PRMPT_001_v1]], [[PRMPT_001_v2]]
	* Active Failures: [[FAIL_004]] (Identity Drift)
* **[[CHAR_002]]** (Confidence: 0.4 | Testing)
	* Linked Prompts: [[PRMPT_002_v1]]
	* Active Failures: [[FAIL_002]] (Semantic Misread)

## 🎬 Scene Nodes & Downstream Vectors
* **[[SCENE_001]]** 
	* Dependencies: [[CHAR_001]]
	* Prompt History: [[PRMPT_001_v2]] (Stable)
* **[[SCENE_002]]**
	* Dependencies: [[CHAR_001]], [[CHAR_002]]
	* Prompt History: [[PRMPT_002_v1]] (Blocked by [[FAIL_002]])